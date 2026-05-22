const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

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

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(rows.map(toUser));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, role, status, vehiclePlate, vehicleModel, password } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'EMAIL_EXISTS' });
    const nameCheck = await pool.query('SELECT id FROM users WHERE name = $1', [name]);
    if (nameCheck.rows.length > 0) return res.status(409).json({ error: 'NAME_EXISTS' });

    const id = `u_${Date.now()}`;
    const hash = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('password', 10);

    const { rows } = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, vehicle_plate, vehicle_model)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, name, email, hash, role || 'USER', status || 'PENDING', vehiclePlate || null, vehicleModel || null]
    );
    res.status(201).json(toUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!userCheck.rows.length) return res.status(404).json({ error: 'Not found' });
    if (userCheck.rows[0].role === 'ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot edit admin' });
    }

    const { name, email, role, vehiclePlate, vehicleModel } = req.body;
    if (email) {
      const dup = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (dup.rows.length > 0) return res.status(409).json({ error: 'EMAIL_EXISTS' });
    }
    if (name) {
      const dup = await pool.query('SELECT id FROM users WHERE name = $1 AND id != $2', [name, id]);
      if (dup.rows.length > 0) return res.status(409).json({ error: 'NAME_EXISTS' });
    }

    const { rows } = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        vehicle_plate = COALESCE($4, vehicle_plate),
        vehicle_model = COALESCE($5, vehicle_model)
       WHERE id = $6 RETURNING *`,
      [name || null, email || null, role || null, vehiclePlate || null, vehicleModel || null, id]
    );
    res.json(toUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(toUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (!userCheck.rows.length) return res.status(404).json({ error: 'Not found' });
    if (userCheck.rows[0].role === 'ADMIN') return res.status(403).json({ error: 'Cannot delete admin' });
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
