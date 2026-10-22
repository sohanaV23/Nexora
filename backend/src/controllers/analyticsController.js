const prisma = require('../config/db');

const getAnalytics = async (req, res) => {
  try {
    const { communityId } = req.query;
    const targetCommId = req.user.role === 'SUPER_ADMIN' && communityId ? communityId : req.communityId;

    const where = {};
    if (targetCommId) where.communityId = targetCommId;

    const complaints = await prisma.complaint.findMany({ where });

    // Category distribution
    const categoryCounts = {};
    complaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Status breakdown
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const open = total - resolved;

    // Recurring fault analysis: group by location/title pattern
    const locationCounts = {};
    complaints.forEach(c => {
      const key = c.location || 'Unknown';
      locationCounts[key] = (locationCounts[key] || 0) + 1;
    });

    const recurringFaults = Object.entries(locationCounts)
      .filter(([_, count]) => count >= 1)
      .map(([facility, count]) => ({
        facility,
        faultCount: count,
        issue: 'Repeated service incidents identified in audit history',
        status: count > 2 ? 'Requires Preventative AMC' : 'Monitored'
      }));

    // Financial summaries
    const invoiceWhere = targetCommId ? { communityId: targetCommId } : {};
    const invoices = await prisma.invoice.findMany({ where: invoiceWhere });
    const totalBilledPaise = invoices.reduce((s, i) => s + i.amountPaise, 0);
    const totalCollectedPaise = invoices.reduce((s, i) => s + i.paidPaise, 0);

    return res.json({
      success: true,
      data: {
        summary: {
          totalComplaints: total,
          openComplaints: open,
          resolvedComplaints: resolved,
          resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 100,
          totalBilledPaise,
          totalCollectedPaise
        },
        categoryDistribution,
        recurringFaults
      }
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to calculate analytics.' } });
  }
};

module.exports = { getAnalytics };
