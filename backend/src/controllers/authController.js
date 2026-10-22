const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        memberships: {
          include: { community: true }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('nexora_token', token, COOKIE_OPTIONS);

    // Default community context
    const activeCommunity = user.memberships[0]?.community || null;
    if (activeCommunity) {
      res.cookie('nexora_community_id', activeCommunity.id, COOKIE_OPTIONS);
    }

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      memberships: user.memberships.map(m => ({
        communityId: m.communityId,
        communityName: m.community.name,
        communityCode: m.community.code,
        role: m.role,
        unitDesignation: m.unitDesignation
      })),
      activeCommunity
    };

    return res.json({
      success: true,
      data: {
        user: sanitizedUser,
        token
      },
      message: `Signed in successfully as ${user.name}`
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal authentication error.' }
    });
  }
};

const me = async (req, res) => {
  try {
    const user = req.user;
    const activeCommunity = req.communityId
      ? await prisma.community.findUnique({ where: { id: req.communityId } })
      : user.memberships[0]?.community || null;

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      memberships: user.memberships.map(m => ({
        communityId: m.communityId,
        communityName: m.community.name,
        communityCode: m.community.code,
        role: m.role,
        unitDesignation: m.unitDesignation
      })),
      activeCommunity
    };

    return res.json({
      success: true,
      data: { user: sanitizedUser }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve profile.' }
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie('nexora_token');
  res.clearCookie('nexora_community_id');
  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
};

const switchCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    if (!communityId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'communityId is required.' }
      });
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const hasMembership = req.user.memberships.some(m => m.communityId === communityId && m.status === 'ACTIVE');
      if (!hasMembership) {
        return res.status(403).json({
          success: false,
          error: { code: 'CROSS_COMMUNITY_DENIED', message: 'You do not have membership in this community.' }
        });
      }
    }

    const targetCommunity = await prisma.community.findUnique({ where: { id: communityId } });
    if (!targetCommunity || targetCommunity.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Active community not found.' }
      });
    }

    res.cookie('nexora_community_id', targetCommunity.id, COOKIE_OPTIONS);

    return res.json({
      success: true,
      data: { activeCommunity: targetCommunity },
      message: `Active context switched to ${targetCommunity.name}`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to switch community.' }
    });
  }
};

// Demo quick-login for evaluation & demonstration
const demoLogin = async (req, res) => {
  try {
    const { roleKey } = req.body; // 'super_admin', 'admin', 'resident', 'worker', 'security', 'tenant', 'landlord'

    const emailMap = {
      'super_admin': 'super.admin@nexora.local',
      'admin': 'ananya.admin@nexora.local',
      'resident': 'rohit.resident@nexora.local',
      'tenant': 'priya.tenant@nexora.local',
      'landlord': 'anand.landlord@nexora.local',
      'worker': 'suresh.maintenance@nexora.local',
      'security': 'ramesh.gate@nexora.local'
    };

    const targetEmail = emailMap[roleKey] || emailMap.resident;
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        memberships: {
          include: { community: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Demo persona not found in database.' }
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('nexora_token', token, COOKIE_OPTIONS);
    const activeCommunity = user.memberships[0]?.community || null;
    if (activeCommunity) {
      res.cookie('nexora_community_id', activeCommunity.id, COOKIE_OPTIONS);
    }

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      memberships: user.memberships.map(m => ({
        communityId: m.communityId,
        communityName: m.community.name,
        communityCode: m.community.code,
        role: m.role,
        unitDesignation: m.unitDesignation
      })),
      activeCommunity
    };

    return res.json({
      success: true,
      data: {
        user: sanitizedUser,
        token
      },
      message: `Switched demo session to ${user.name} (${user.role})`
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to switch demo persona.' }
    });
  }
};

module.exports = { login, me, logout, switchCommunity, demoLogin };
