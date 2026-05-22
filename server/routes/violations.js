const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const toViolation = (v) => ({
  id: v.id,
  timestamp: v.timestamp,
  reportedBy: v.reported_by,
  reportedByName: v.reported_by_name || v.reported_by,
  vehiclePlate: v.vehicle_plate,
  description: v.description,
  status: v.status,
  location: v.location
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.*, u.name AS reported_by_name
      FROM violations v
      LEFT JOIN users u ON u.id = v.reported_by
      ORDER BY v.timestamp DESC
    `);
    res.json(rows.map(toViolation));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { vehiclePlate, description, location } = req.body;
    const reportedBy = req.user.id;
    const id = `v_${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO violations (id, timestamp, reported_by, vehicle_plate, description, status, location)
       VALUES ($1, NOW(), $2, $3, $4, 'OPEN', $5) RETURNING *`,
      [id, reportedBy, vehiclePlate, description, location]
    );
    const { rows: joined } = await pool.query(`
      SELECT v.*, u.name AS reported_by_name
      FROM violations v
      LEFT JOIN users u ON u.id = v.reported_by
      WHERE v.id = $1
    `, [rows[0].id]);
    res.status(201).json(toViolation(joined[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/resolve', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE violations SET status = 'RESOLVED' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(toViolation(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { rows } = await pool.query(
      'UPDATE violations SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(toViolation(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
