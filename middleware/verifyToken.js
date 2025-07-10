const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.googleId !== process.env.ADMIN_GOOGLE_ID) {
      return res.status(403).json({ message: 'Access denied: not admin' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
