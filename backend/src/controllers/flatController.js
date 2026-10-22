const prisma = require('../config/db');

const getFlats = async (req, res) => {
  try {
    const { communityId } = req.query;
    const targetCommId = req.user.role === 'SUPER_ADMIN' && communityId ? communityId : req.communityId;

    const flats = await prisma.flat.findMany({
      where: targetCommId ? { communityId: targetCommId } : {},
      include: {
        building: true,
        tenancies: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: { select: { id: true, name: true, email: true, phone: true } },
            landlord: { select: { id: true, name: true, phone: true } }
          }
        }
      },
      orderBy: { flatNumber: 'asc' }
    });

    return res.json({ success: true, data: { flats } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch flats.' } });
  }
};

module.exports = { getFlats };
