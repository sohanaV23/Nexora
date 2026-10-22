const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_local_dev_jwt_key_change_in_production_nexora_2026';

const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.nexora_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          include: { community: true }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'User account is suspended or invalid.' }
      });
    }

    req.user = user;
    // Set active community id from request header, cookie or first membership
    const requestedCommId = req.headers['x-community-id'] || req.cookies?.nexora_community_id;
    if (requestedCommId) {
      req.communityId = requestedCommId;
    } else if (user.memberships.length > 0) {
      req.communityId = user.memberships[0].communityId;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or token invalid. Please log in again.' }
    });
  }
};

module.exports = { authenticate, JWT_SECRET };
