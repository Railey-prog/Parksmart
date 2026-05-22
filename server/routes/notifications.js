const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const toNotification = (n) => ({
  id: n.id,
  userId: n.user_id,
  title: n.title,
  message: n.message,
  timestamp: n.timestamp,
  read: n.read,
  type: n.type,
  targetRole: n.target_role
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 200');
    res.json(rows.map(toNotification));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { userId, title, message, type, targetRole } = req.body;
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const { rows } = await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, timestamp, read, type, target_role)
       VALUES ($1, $2, $3, $4, NOW(), false, $5, $6) RETURNING *`,
      [id, userId || 'system', title, message, type || 'INFO', targetRole || 'ALL']
    );
    res.status(201).json(toNotification(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const { role } = req.query;
    await pool.query(
      "UPDATE notifications SET read = true WHERE target_role = $1 OR target_role = 'ALL'",
      [role]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
