const prisma = require('../config/db');

const getTenancies = async (req, res) => {
  try {
    const { communityId, status } = req.query;
    const user = req.user;

    const where = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.flat = {
        communityId: req.communityId || communityId
      };
    } else if (communityId) {
      where.flat = { communityId };
    }

    if (status) {
      where.status = status;
    }

    // If resident/tenant, only view own tenancy
    if (user.role === 'RESIDENT') {
      where.OR = [
        { tenantId: user.id },
        { landlordId: user.id }
      ];
    }

    const tenancies = await prisma.tenancy.findMany({
      where,
      include: {
        flat: {
          include: { building: true, community: true }
        },
        tenant: {
          select: { id: true, name: true, email: true, phone: true }
        },
        landlord: {
          select: { id: true, name: true, email: true, phone: true }
        },
        invoices: {
          orderBy: { dueDate: 'desc' }
        }
      },
      orderBy: { leaseStart: 'desc' }
    });

    return res.json({
      success: true,
      data: { tenancies }
    });
  } catch (err) {
    console.error('getTenancies error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve tenancies.' }
    });
  }
};

const createTenancy = async (req, res) => {
  try {
    const {
      flatId,
      tenantEmail,
      tenantName,
      tenantPhone,
      leaseStart,
      leaseEnd,
      monthlyRentPaise,
      securityDepositPaise,
      dueDay,
      moveInNotes
    } = req.body;

    if (!flatId || !tenantEmail || !leaseStart || !leaseEnd || !monthlyRentPaise) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'flatId, tenantEmail, lease dates, and rent amount are required.' }
      });
    }

    const flat = await prisma.flat.findUnique({
      where: { id: flatId },
      include: { community: true }
    });

    if (!flat) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flat not found.' }
      });
    }

    // Find or create tenant user account
    let tenant = await prisma.user.findUnique({ where: { email: tenantEmail.toLowerCase().trim() } });
    if (!tenant) {
      const defaultPasswordHash = require('bcryptjs').hashSync('Password123!', 10);
      tenant = await prisma.user.create({
        data: {
          email: tenantEmail.toLowerCase().trim(),
          name: tenantName || 'Rental Tenant',
          phone: tenantPhone || null,
          passwordHash: defaultPasswordHash,
          role: 'RESIDENT'
        }
      });
    }

    // Ensure tenant has membership in the community
    await prisma.communityMembership.upsert({
      where: {
        userId_communityId_role: {
          userId: tenant.id,
          communityId: flat.communityId,
          role: 'RESIDENT'
        }
      },
      update: {
        unitDesignation: `${flat.flatNumber} (Tenant)`
      },
      create: {
        userId: tenant.id,
        communityId: flat.communityId,
        role: 'RESIDENT',
        unitDesignation: `${flat.flatNumber} (Tenant)`
      }
    });

    const tenancy = await prisma.tenancy.create({
      data: {
        flatId: flat.id,
        tenantId: tenant.id,
        landlordId: req.user.id,
        leaseStart: new Date(leaseStart),
        leaseEnd: new Date(leaseEnd),
        monthlyRentPaise: parseInt(monthlyRentPaise, 10),
        securityDepositPaise: parseInt(securityDepositPaise || 0, 10),
        dueDay: parseInt(dueDay || 5, 10),
        status: 'ACTIVE',
        moveInNotes: moveInNotes || 'Move-in inspection checklist verified.',
        depositStatus: 'HELD'
      }
    });

    // Update flat occupancy
    await prisma.flat.update({
      where: { id: flat.id },
      data: { occupancyStatus: 'TENANT_OCCUPIED' }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        communityId: flat.communityId,
        actorId: req.user.id,
        action: 'TENANCY_CREATED',
        resource: 'Tenancy',
        details: `Created lease for ${flat.flatNumber} with tenant ${tenant.name}. Monthly rent: ₹${(monthlyRentPaise / 100).toFixed(2)}.`
      }
    });

    return res.status(201).json({
      success: true,
      data: { tenancy },
      message: 'Tenancy agreement registered and tenant account linked.'
    });
  } catch (err) {
    console.error('createTenancy error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create tenancy.' }
    });
  }
};

const moveOutSettlement = async (req, res) => {
  try {
    const { id: tenancyId } = req.params;
    const { moveOutInspection, depositDeductionsPaise, depositDeductionReason } = req.body;

    const tenancy = await prisma.tenancy.findUnique({
      where: { id: tenancyId },
      include: { flat: true, tenant: true }
    });

    if (!tenancy) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tenancy not found.' }
      });
    }

    const deductions = parseInt(depositDeductionsPaise || 0, 10);
    const refund = Math.max(0, tenancy.securityDepositPaise - deductions);

    const updated = await prisma.tenancy.update({
      where: { id: tenancyId },
      data: {
        status: 'CLOSED',
        moveOutDate: new Date(),
        moveOutInspection: moveOutInspection || 'Move-out handover completed.',
        depositDeductionsPaise: deductions,
        depositDeductionReason: depositDeductionReason || null,
        depositRefundPaise: refund,
        depositStatus: deductions > 0 && refund === 0 ? 'SETTLED' : refund > 0 ? 'PARTIALLY_REFUNDED' : 'FULLY_REFUNDED'
      }
    });

    // Update flat to VACANT
    await prisma.flat.update({
      where: { id: tenancy.flatId },
      data: { occupancyStatus: 'VACANT' }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        communityId: tenancy.flat.communityId,
        actorId: req.user.id,
        action: 'TENANCY_MOVE_OUT',
        resource: 'Tenancy',
        details: `Move-out completed for ${tenancy.flat.flatNumber}. Deposit deductions: ₹${(deductions / 100).toFixed(2)}, Refundable: ₹${(refund / 100).toFixed(2)}.`
      }
    });

    return res.json({
      success: true,
      data: { tenancy: updated },
      message: `Move-out settlement finalized. Net refund: ₹${(refund / 100).toFixed(2)}. Flat marked as Vacant.`
    });
  } catch (err) {
    console.error('moveOutSettlement error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to process move-out settlement.' }
    });
  }
};

module.exports = { getTenancies, createTenancy, moveOutSettlement };
