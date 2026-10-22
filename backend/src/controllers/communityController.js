const prisma = require('../config/db');

const getCommunities = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'SUPER_ADMIN') {
      const all = await prisma.community.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' }
      });
      return res.json({ success: true, data: { communities: all } });
    }

    const memberships = await prisma.communityMembership.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { community: true }
    });

    const communities = memberships.map(m => m.community);
    return res.json({ success: true, data: { communities } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch communities.' } });
  }
};

const createCommunity = async (req, res) => {
  try {
    const { name, code, address, city } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name and code are required.' } });
    }

    const community = await prisma.community.create({
      data: {
        name,
        code: code.toUpperCase().trim(),
        address: address || 'Community Address',
        city: city || 'Hyderabad',
        status: 'ACTIVE'
      }
    });

    await prisma.auditLog.create({
      data: {
        communityId: community.id,
        actorId: req.user.id,
        action: 'COMMUNITY_CREATED',
        resource: 'Community',
        details: `Platform Super Admin created community ${community.name} (${community.code}).`
      }
    });

    return res.status(201).json({ success: true, data: { community }, message: 'Community registered successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create community.' } });
  }
};

module.exports = { getCommunities, createCommunity };
