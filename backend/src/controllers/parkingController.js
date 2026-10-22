const prisma = require('../config/db');

const getParkingSlots = async (req, res) => {
  try {
    const slots = await prisma.parkingSlot.findMany({
      where: { communityId: req.communityId },
      include: { allocatedFlat: true },
      orderBy: { slotNumber: 'asc' }
    });
    return res.json({ success: true, data: { parkingSlots: slots } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch parking slots.' } });
  }
};

module.exports = { getParkingSlots };
