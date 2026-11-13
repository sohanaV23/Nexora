const prisma = require('../config/db');

const getParkingSlots = async (req, res) => {
  try {
    const { communityId } = req.query;
    const targetCommId = (req.user.role === 'SUPER_ADMIN' && communityId) ? communityId : req.communityId;

    const where = {};
    if (targetCommId) where.communityId = targetCommId;

    const slots = await prisma.parkingSlot.findMany({
      where,
      include: { allocatedFlat: true },
      orderBy: { slotNumber: 'asc' }
    });
    return res.json({ success: true, data: { parkingSlots: slots } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch parking slots.' } });
  }
};

const allocateParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { flatId, vehicleType } = req.body;

    const slot = await prisma.parkingSlot.findUnique({ where: { id } });
    if (!slot) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parking slot not found.' } });
    }

    const updated = await prisma.parkingSlot.update({
      where: { id },
      data: {
        allocatedFlatId: flatId || null,
        status: flatId ? 'ALLOCATED' : 'AVAILABLE',
        ...(vehicleType ? { vehicleType } : {})
      },
      include: { allocatedFlat: true }
    });

    return res.json({
      success: true,
      data: { parkingSlot: updated },
      message: flatId ? `Slot ${updated.slotNumber} allocated.` : `Slot ${updated.slotNumber} released.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to allocate parking slot.' } });
  }
};

module.exports = { getParkingSlots, allocateParkingSlot };

