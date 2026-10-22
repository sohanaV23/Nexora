const prisma = require('../config/db');

const getOverview = async (req, res) => {
  try {
    const totalCommunities = await prisma.community.count();
    const activeCommunities = await prisma.community.count({ where: { status: 'ACTIVE' } });
    const suspendedCommunities = await prisma.community.count({ where: { status: 'SUSPENDED' } });

    const totalUsers = await prisma.user.count();
    const totalFlats = await prisma.flat.count();
    const totalComplaints = await prisma.complaint.count();
    const openComplaints = await prisma.complaint.count({
      where: { status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] } }
    });

    const totalTenancies = await prisma.tenancy.count({ where: { status: 'ACTIVE' } });

    // Financial aggregates across all communities
    const invoices = await prisma.invoice.findMany({
      select: { amountPaise: true, paidPaise: true, balancePaise: true, invoiceType: true }
    });

    const totalBilledPaise = invoices.reduce((sum, inv) => sum + inv.amountPaise, 0);
    const totalCollectedPaise = invoices.reduce((sum, inv) => sum + inv.paidPaise, 0);
    const totalOutstandingPaise = invoices.reduce((sum, inv) => sum + inv.balancePaise, 0);

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        community: { select: { name: true, code: true } },
        actor: { select: { name: true, email: true, role: true } }
      }
    });

    return res.json({
      success: true,
      data: {
        communities: {
          total: totalCommunities,
          active: activeCommunities,
          suspended: suspendedCommunities
        },
        platform: {
          totalUsers,
          totalFlats,
          totalTenancies,
          totalComplaints,
          openComplaints
        },
        finances: {
          totalBilledPaise,
          totalCollectedPaise,
          totalOutstandingPaise,
          collectionRatePercent: totalBilledPaise > 0 ? ((totalCollectedPaise / totalBilledPaise) * 100).toFixed(1) : 0
        },
        recentAuditLogs
      }
    });
  } catch (err) {
    console.error('getOverview error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve platform overview.' }
    });
  }
};

const getCommunities = async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            flats: true,
            memberships: true,
            complaints: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: { communities } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve communities.' } });
  }
};

const toggleCommunityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status must be ACTIVE or SUSPENDED.' }
      });
    }

    const updated = await prisma.community.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        communityId: id,
        actorId: req.user.id,
        action: 'COMMUNITY_STATUS_CHANGE',
        resource: 'Community',
        details: `Platform admin changed status of ${updated.name} to ${status}.`
      }
    });

    return res.json({
      success: true,
      data: { community: updated },
      message: `Community status changed to ${status}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update community status.' } });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: {
        community: { select: { name: true, code: true } },
        actor: { select: { name: true, email: true, role: true } }
      }
    });

    return res.json({ success: true, data: { auditLogs: logs } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch audit logs.' } });
  }
};

module.exports = { getOverview, getCommunities, toggleCommunityStatus, getAuditLogs };
