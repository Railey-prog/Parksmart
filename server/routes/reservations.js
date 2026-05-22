const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const toRes = (r) => ({
  id: r.id,
  userId: r.user_id,
  slotId: r.slot_id,
  zoneId: r.zone_id,
  startTime: r.start_time,
  endTime: r.end_time,
  status: r.status
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
    res.json(rows.map(toRes));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { userId, slotId, zoneId, durationMinutes } = req.body;
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);
    const id = `r_${Date.now()}`;

    await pool.query(
      `INSERT INTO reservations (id, user_id, slot_id, zone_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')`,
      [id, userId, slotId, zoneId, now, endTime]
    );
    await pool.query('UPDATE slots SET status = $1 WHERE id = $2', ['RESERVED', slotId]);

    res.status(201).json({ id, userId, slotId, zoneId, startTime: now.toISOString(), endTime: endTime.toISOString(), status: 'ACTIVE' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const reservation = rows[0];
    if (reservation.status === 'ACTIVE') {
      await pool.query('UPDATE slots SET status = $1 WHERE id = $2', ['AVAILABLE', reservation.slot_id]);
    }
    await pool.query('UPDATE reservations SET status = $1 WHERE id = $2', ['CANCELLED', req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/expire', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    await pool.query('UPDATE slots SET status = $1 WHERE id = $2', ['AVAILABLE', rows[0].slot_id]);
    await pool.query('UPDATE reservations SET status = $1 WHERE id = $2', ['EXPIRED', req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
