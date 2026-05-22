const router = require('express').Router();
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const toPermit = (p) => ({
  id: p.id,
  userId: p.user_id,
  permitNumber: p.permit_number,
  vehiclePlate: p.vehicle_plate,
  issueDate: p.issue_date,
  expiryDate: p.expiry_date,
  status: p.status
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM permits ORDER BY created_at DESC');
    res.json(rows.map(toPermit));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { userId, vehiclePlate } = req.body;
    const existing = await pool.query(
      "SELECT id FROM permits WHERE user_id = $1 AND status IN ('ACTIVE', 'PENDING')",
      [userId]
    );
    if (existing.rows.length > 0) return res.status(409).json({ error: 'PERMIT_EXISTS' });

    const id = `p_${Date.now()}`;
    const permitNumber = `PRM-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    const issueDate = new Date();
    const expiryDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const { rows } = await pool.query(
      `INSERT INTO permits (id, user_id, permit_number, vehicle_plate, issue_date, expiry_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING') RETURNING *`,
      [id, userId, permitNumber, vehiclePlate, issueDate, expiryDate]
    );
    res.status(201).json(toPermit(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE permits SET status = 'ACTIVE' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(toPermit(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/revoke', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE permits SET status = 'REVOKED' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(toPermit(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
