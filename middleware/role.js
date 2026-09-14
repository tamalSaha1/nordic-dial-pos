// Usage: managerOnly  -> only 'manager' role can pass
//        allowRoles('manager', 'staff') -> whitelist specific roles

const managerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Manager privileges required' });
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  };
};

module.exports = { managerOnly, allowRoles };
