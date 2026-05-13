const ApiError = require('../utils/ApiError');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied. Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
};

module.exports = { restrictTo };
