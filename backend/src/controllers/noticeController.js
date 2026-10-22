const prisma = require('../config/db');

const getNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      where: { communityId: req.communityId },
      orderBy: { publishedAt: 'desc' }
    });
    return res.json({ success: true, data: { notices } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch notices.' } });
  }
};

const publishNotice = async (req, res) => {
  try {
    const { title, content, category, audience, isImportant } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Title and content required.' } });
    }

    const notice = await prisma.notice.create({
      data: {
        communityId: req.communityId,
        title,
        content,
        category: category || 'GENERAL',
        audience: audience || 'ALL_RESIDENTS',
        isImportant: !!isImportant
      }
    });

    return res.status(201).json({ success: true, data: { notice }, message: 'Community circular published.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to publish notice.' } });
  }
};

module.exports = { getNotices, publishNotice };
