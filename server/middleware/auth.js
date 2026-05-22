const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'parksmart_secret_2026';

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    next();
  });
};

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
