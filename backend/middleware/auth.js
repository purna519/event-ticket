// ─── middleware/auth.js ────────────────────────────────────────────────────────
// JWT verification middleware for protecting admin-only routes
// ──────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  // Expect: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.admin = decoded; // attach admin info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
