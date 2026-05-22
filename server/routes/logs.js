const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const toLog = (l) => ({
  id: l.id,
  timestamp: l.timestamp,
  type: l.type,
  description: l.description,
  userId: l.user_id,
  vehiclePlate: l.vehicle_plate,
  severity: l.severity
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 500');
    res.json(rows.map(toLog));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, description, userId, vehiclePlate, severity } = req.body;
    const id = `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const { rows } = await pool.query(
      `INSERT INTO logs (id, timestamp, type, description, user_id, vehicle_plate, severity)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6) RETURNING *`,
      [id, type, description, userId || null, vehiclePlate || null, severity || 'INFO']
    );
    res.status(201).json(toLog(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
