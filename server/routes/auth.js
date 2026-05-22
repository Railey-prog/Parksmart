const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const toUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  vehiclePlate: row.vehicle_plate,
  vehicleModel: row.vehicle_model,
  avatar: row.avatar
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    if (user.status === 'PENDING') return res.status(403).json({ error: 'PENDING' });
    if (user.status === 'REJECTED') return res.status(403).json({ error: 'REJECTED' });

    if (user.password_hash) {
      const valid = await bcrypt.compare(password || '', user.password_hash);
      if (!valid) return res.status(401).json({ error: 'INVALID_PASSWORD' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: toUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, vehiclePlate, vehicleModel } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    if (!email.toLowerCase().endsWith('@parksmart.edu')) return res.status(400).json({ error: 'INVALID_DOMAIN' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'EMAIL_EXISTS' });

    const id = `u_${Date.now()}`;
    const hash = password ? await bcrypt.hash(password, 10) : null;

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, vehicle_plate, vehicle_model)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7)`,
      [id, name, email, hash, role || 'USER', vehiclePlate || null, vehicleModel || null]
    );

    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, timestamp, read, type, target_role)
       VALUES ($1, 'system', $2, $3, NOW(), false, 'INFO', 'ADMIN')`,
      [
        `n_${Date.now()}`,
        'New Account Registration',
        `${name} (${email}) has registered as ${role || 'USER'} and is awaiting your approval.`
      ]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
