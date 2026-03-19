// ─── middleware/userAuth.js ───────────────────────────────────────────────────
// Protects routes so only authenticated attendee users can access them
// ──────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'member_secret_key';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorisation required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'user') {
       return res.status(401).json({ error: 'User access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
