const prisma = require('../config/db');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const getComplaints = async (req, res) => {
  try {
    const { communityId, status, category, priority } = req.query;
    const user = req.user;

    const where = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.communityId = req.communityId || communityId;
    } else if (communityId) {
      where.communityId = communityId;
    }

    if (user.role === 'RESIDENT') {
      where.reporterId = user.id;
    } else if (user.role === 'WORKER') {
      where.OR = [
        { assignedWorkerId: user.id },
        { status: 'SUBMITTED' }
      ];
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        flat: { include: { building: true } },
        reporter: { select: { id: true, name: true, phone: true } },
        assignedWorker: { select: { id: true, name: true, phone: true } },
        timeline: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: { complaints }
    });
  } catch (err) {
    console.error('getComplaints error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve complaints.' }
    });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, flatId, location } = req.body;
    const user = req.user;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title and description are required.' }
      });
    }

    // Determine target flat
    let targetFlatId = flatId;
    let targetCommunityId = req.communityId;

    if (!targetFlatId) {
      // Find flat associated with user
      const userTenancy = await prisma.tenancy.findFirst({
        where: { tenantId: user.id, status: 'ACTIVE' },
        include: { flat: true }
      });
      if (userTenancy) {
        targetFlatId = userTenancy.flatId;
        targetCommunityId = userTenancy.flat.communityId;
      } else {
        const anyFlat = await prisma.flat.findFirst({
          where: { communityId: targetCommunityId }
        });
        targetFlatId = anyFlat?.id;
      }
    }

    if (!targetFlatId || !targetCommunityId) {
      return res.status(400).json({
        success: false,
        error: { code: 'FLAT_REQUIRED', message: 'A valid flat and community context are required.' }
      });
    }

    // Call local ML Service with graceful fallback if offline
    let mlSuggestedCategory = null;
    let confidenceScore = null;
    let duplicateWarningRef = null;

    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/v1/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
        signal: AbortSignal.timeout(1500) // 1.5s timeout
      });
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        mlSuggestedCategory = mlData.predicted_category;
        confidenceScore = mlData.confidence;
      }
    } catch (mlErr) {
      // Offline fallback: ML is a helper, application remains 100% operational
      console.log('ℹ️ ML Service offline or timed out. Operating in standalone mode.');
    }

    // Check for potential duplicate complaint in the same community/building
    const recentSimilar = await prisma.complaint.findFirst({
      where: {
        communityId: targetCommunityId,
        category: category || mlSuggestedCategory || 'Other',
        status: { in: ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'] }
      }
    });

    if (recentSimilar) {
      duplicateWarningRef = recentSimilar.complaintNumber;
    }

    const assignedPriority = priority || (mlSuggestedCategory === 'Elevator & Lift' ? 'URGENT' : 'MEDIUM');
    const slaTargetHours = assignedPriority === 'URGENT' ? 4 : assignedPriority === 'HIGH' ? 8 : 24;

    const count = await prisma.complaint.count();
    const complaintNumber = `CMP-2026-00${count + 1}`;

    const complaint = await prisma.complaint.create({
      data: {
        complaintNumber,
        communityId: targetCommunityId,
        flatId: targetFlatId,
        reporterId: user.id,
        category: category || mlSuggestedCategory || 'Other',
        title,
        description,
        location: location || 'Flat & Common Area',
        priority: assignedPriority,
        status: 'SUBMITTED',
        slaTargetHours,
        mlSuggestedCategory,
        confidenceScore,
        duplicateWarningRef
      }
    });

    // Record initial timeline audit step
    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        actorId: user.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'SUBMITTED',
        note: `Complaint logged by ${user.name}. ${duplicateWarningRef ? `Potential duplicate flag: ${duplicateWarningRef}` : ''}`
      }
    });

    return res.status(201).json({
      success: true,
      data: { complaint },
      message: 'Complaint lodged successfully.'
    });
  } catch (err) {
    console.error('createComplaint error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create complaint.' }
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: nextStatus, note } = req.body;
    const user = req.user;

    const validTransitions = [
      'SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'REJECTED'
    ];

    if (!validTransitions.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validTransitions.join(', ')}` }
      });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' }
      });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: nextStatus }
    });

    await prisma.complaintTimeline.create({
      data: {
        complaintId: id,
        actorId: user.id,
        fromStatus: complaint.status,
        toStatus: nextStatus,
        note: note || `Status updated from ${complaint.status} to ${nextStatus} by ${user.name}`
      }
    });

    return res.json({
      success: true,
      data: { complaint: updated },
      message: `Status updated to ${nextStatus}`
    });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update complaint status.' }
    });
  }
};

const assignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, workerName } = req.body;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' }
      });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        assignedWorkerId: workerId || null,
        status: 'ASSIGNED'
      }
    });

    await prisma.complaintTimeline.create({
      data: {
        complaintId: id,
        actorId: req.user.id,
        fromStatus: complaint.status,
        toStatus: 'ASSIGNED',
        note: `Assigned to technician ${workerName || 'Staff'} by ${req.user.name}`
      }
    });

    return res.json({
      success: true,
      data: { complaint: updated },
      message: `Assigned technician to complaint.`
    });
  } catch (err) {
    console.error('assignWorker error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to assign worker.' }
    });
  }
};

module.exports = { getComplaints, createComplaint, updateStatus, assignWorker };
