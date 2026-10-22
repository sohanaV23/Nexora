const prisma = require('../config/db');

const getVisitors = async (req, res) => {
  try {
    const { communityId } = req.query;
    const targetCommId = req.user.role === 'SUPER_ADMIN' && communityId ? communityId : req.communityId;

    const where = {};
    if (targetCommId) where.communityId = targetCommId;

    const visitors = await prisma.visitorPass.findMany({
      where,
      include: { flat: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: { visitors } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch visitors.' } });
  }
};

const createPass = async (req, res) => {
  try {
    const { visitorName, phone, purpose, expectedDate, expectedTime, flatId } = req.body;

    let targetFlatId = flatId;
    if (!targetFlatId) {
      const anyFlat = await prisma.flat.findFirst({ where: { communityId: req.communityId } });
      targetFlatId = anyFlat?.id;
    }

    const randomCode = `NX-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = await prisma.visitorPass.create({
      data: {
        passCode: randomCode,
        communityId: req.communityId,
        flatId: targetFlatId,
        visitorName,
        phone,
        purpose: purpose || 'Personal Guest',
        expectedDate: expectedDate || new Date().toISOString().split('T')[0],
        expectedTime: expectedTime || '12:00 PM',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'APPROVED'
      }
    });

    return res.status(201).json({ success: true, data: { pass }, message: `Visitor pass ${randomCode} issued.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create pass.' } });
  }
};

const validatePass = async (req, res) => {
  try {
    const { passCode, action } = req.body; // action: 'CHECK_IN' or 'CHECK_OUT'

    const pass = await prisma.visitorPass.findFirst({
      where: { passCode: passCode.toUpperCase().trim() },
      include: { flat: true }
    });

    if (!pass) {
      return res.status(404).json({ success: false, error: { code: 'INVALID_PASS', message: 'No valid digital pass matches code.' } });
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updated;

    if (action === 'CHECK_OUT') {
      updated = await prisma.visitorPass.update({
        where: { id: pass.id },
        data: { status: 'DEPARTED', exitTime: timeNow }
      });
    } else {
      updated = await prisma.visitorPass.update({
        where: { id: pass.id },
        data: { status: 'CHECKED_IN', entryTime: timeNow }
      });
    }

    return res.json({ success: true, data: { pass: updated }, message: `Visitor ${action === 'CHECK_OUT' ? 'checkout' : 'check-in'} recorded.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to validate pass.' } });
  }
};

module.exports = { getVisitors, createPass, validatePass };
