const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const protect = (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) throw new ApiError(401, 'Not authenticated. Please log in.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
