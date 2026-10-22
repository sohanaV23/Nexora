const prisma = require('../config/db');

const getInvoices = async (req, res) => {
  try {
    const { communityId, type, status } = req.query;
    const user = req.user;

    const where = {};

    // Community scoping
    if (user.role !== 'SUPER_ADMIN') {
      where.communityId = req.communityId || communityId;
    } else if (communityId) {
      where.communityId = communityId;
    }

    // Role-based visibility
    if (user.role === 'RESIDENT') {
      // Resident sees invoices where they are payer OR invoices for their flat
      where.payerId = user.id;
    }

    // Filter by type: ASSOCIATION_MAINTENANCE vs CONTRACTUAL_RENT
    if (type) {
      where.invoiceType = type;
    }

    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        flat: {
          include: { building: true }
        },
        payer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        tenancy: {
          include: {
            landlord: { select: { id: true, name: true, phone: true } },
            tenant: { select: { id: true, name: true, phone: true } }
          }
        },
        payments: {
          include: {
            reportedBy: { select: { id: true, name: true } },
            verifiedBy: { select: { id: true, name: true } }
          },
          orderBy: { reportedAt: 'desc' }
        }
      },
      orderBy: { dueDate: 'desc' }
    });

    return res.json({
      success: true,
      data: { invoices }
    });
  } catch (err) {
    console.error('getInvoices error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve invoices.' }
    });
  }
};

const reportPayment = async (req, res) => {
  try {
    const { id: invoiceId } = req.params;
    const { amountPaise, paymentMethod, transactionReference, proofNotes, isSimulated } = req.body;

    if (!amountPaise || amountPaise <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'Payment amount must be greater than zero.' }
      });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { flat: true }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invoice not found.' }
      });
    }

    // Authorization: User must be payer or admin or super admin
    if (req.user.role === 'RESIDENT' && invoice.payerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only report payments for your own invoices.' }
      });
    }

    // Prevent duplicate active transaction references
    if (transactionReference) {
      const existingRef = await prisma.payment.findFirst({
        where: {
          transactionReference,
          status: { in: ['PENDING_VERIFICATION', 'VERIFIED'] }
        }
      });
      if (existingRef && !isSimulated) {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_REFERENCE', message: 'This transaction reference number has already been submitted.' }
        });
      }
    }

    // Create payment entry in PENDING_VERIFICATION state
    // Important: DO NOT deduct balance yet! Official balance reduces ONLY on verification!
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amountPaise: parseInt(amountPaise, 10),
        paymentMethod: paymentMethod || 'OUTSIDE_UPI',
        transactionReference: transactionReference || `REF-${Date.now()}`,
        isSimulated: !!isSimulated,
        status: 'PENDING_VERIFICATION',
        reportedById: req.user.id,
        proofNotes: proofNotes || (isSimulated ? 'Simulated demo transaction' : null)
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        communityId: invoice.communityId,
        actorId: req.user.id,
        action: 'PAYMENT_REPORTED',
        resource: 'Payment',
        details: `Reported payment of ₹${(amountPaise / 100).toFixed(2)} for ${invoice.invoiceNumber}. Status: Pending Verification.`
      }
    });

    return res.status(201).json({
      success: true,
      data: { payment },
      message: 'Payment reported successfully. It is now awaiting administrator verification.'
    });
  } catch (err) {
    console.error('reportPayment error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to record payment.' }
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'VERIFY' or 'REJECT'

    if (!['VERIFY', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ACTION', message: 'Action must be VERIFY or REJECT.' }
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: { flat: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Payment record not found.' }
      });
    }

    if (payment.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: `Payment is already in ${payment.status} state.` }
      });
    }

    const invoice = payment.invoice;

    if (action === 'REJECT') {
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REJECTED',
          verifiedAt: new Date(),
          verifiedById: req.user.id,
          rejectionReason: rejectionReason || 'Payment could not be verified in bank statement.'
        }
      });

      await prisma.auditLog.create({
        data: {
          communityId: invoice.communityId,
          actorId: req.user.id,
          action: 'PAYMENT_REJECTED',
          resource: 'Payment',
          details: `Rejected payment of ₹${(payment.amountPaise / 100).toFixed(2)} for ${invoice.invoiceNumber}. Reason: ${rejectionReason}`
        }
      });

      return res.json({
        success: true,
        data: { payment: updatedPayment },
        message: 'Payment rejected. Outstanding balance remains unchanged.'
      });
    }

    // ACTION === 'VERIFY'
    // 1. Generate official verifiable receipt number
    const receiptNumber = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Mark payment as VERIFIED
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: req.user.id,
        receiptNumber
      }
    });

    // 3. Recalculate invoice verified payments and balance using decimal-safe integer paise
    const allVerifiedPayments = await prisma.payment.findMany({
      where: { invoiceId: invoice.id, status: 'VERIFIED' }
    });

    const totalPaidPaise = allVerifiedPayments.reduce((sum, p) => sum + p.amountPaise, 0);
    const newBalancePaise = Math.max(0, invoice.amountPaise - totalPaidPaise - invoice.creditsPaise);
    const newStatus = newBalancePaise === 0 ? 'PAID' : totalPaidPaise > 0 ? 'PARTIALLY_PAID' : 'ISSUED';

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidPaise: totalPaidPaise,
        balancePaise: newBalancePaise,
        status: newStatus
      }
    });

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        communityId: invoice.communityId,
        actorId: req.user.id,
        action: 'PAYMENT_VERIFIED',
        resource: 'Payment',
        details: `Verified payment of ₹${(payment.amountPaise / 100).toFixed(2)} for ${invoice.invoiceNumber}. Receipt ${receiptNumber} generated. New balance: ₹${(newBalancePaise / 100).toFixed(2)}.`
      }
    });

    return res.json({
      success: true,
      data: {
        payment: updatedPayment,
        invoice: updatedInvoice
      },
      message: `Payment verified. Official receipt ${receiptNumber} generated and invoice balance updated.`
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to verify payment.' }
    });
  }
};

module.exports = { getInvoices, reportPayment, verifyPayment };
