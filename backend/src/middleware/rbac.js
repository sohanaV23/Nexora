const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required.' }
      });
    }

    // Platform Super Admin always passes role checks
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check primary role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check community-specific membership role if communityId is scoped
    if (req.communityId) {
      const match = req.user.memberships.find(
        m => m.communityId === req.communityId && allowedRoles.includes(m.role) && m.status === 'ACTIVE'
      );
      if (match) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' }
    });
  };
};

const requireCommunityScope = (req, res, next) => {
  if (!req.communityId && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(400).json({
      success: false,
      error: { code: 'COMMUNITY_REQUIRED', message: 'A valid community context must be selected.' }
    });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const hasAccess = req.user.memberships.some(
    m => m.communityId === req.communityId && m.status === 'ACTIVE'
  );

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: { code: 'CROSS_COMMUNITY_DENIED', message: 'You do not have access to this community.' }
    });
  }

  next();
};

module.exports = { requireRole, requireCommunityScope };
