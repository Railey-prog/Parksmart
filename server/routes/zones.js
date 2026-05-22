const router = require('express').Router();
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const buildZones = async () => {
  const { rows: zoneRows } = await pool.query('SELECT * FROM zones ORDER BY created_at');
  const { rows: slotRows } = await pool.query('SELECT * FROM slots ORDER BY name');
  return zoneRows.map((z) => ({
    id: z.id,
    name: z.name,
    description: z.description,
    capacity: z.capacity,
    slots: slotRows
      .filter((s) => s.zone_id === z.id)
      .map((s) => ({
        id: s.id,
        zoneId: s.zone_id,
        name: s.name,
        status: s.status,
        isAccessible: s.is_accessible,
        isEV: s.is_ev
      }))
  }));
};

router.get('/', requireAuth, async (req, res) => {
  try {
    res.json(await buildZones());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description, capacity } = req.body;
    const id = `z_${Date.now()}`;
    await pool.query(
      'INSERT INTO zones (id, name, description, capacity) VALUES ($1, $2, $3, $4)',
      [id, name, description || '', capacity || 0]
    );
    res.status(201).json({ id, name, description: description || '', capacity: capacity || 0, slots: [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, capacity } = req.body;
    await pool.query(
      `UPDATE zones SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        capacity = COALESCE($3, capacity)
       WHERE id = $4`,
      [name || null, description || null, capacity ?? null, req.params.id]
    );
    res.json(await buildZones().then((z) => z.find((z) => z.id === req.params.id)));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM zones WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:zoneId/slots', requireAdmin, async (req, res) => {
  try {
    const { name, isAccessible, isEV } = req.body;
    const { zoneId } = req.params;
    const id = `s_${Date.now()}`;
    const { rows } = await pool.query(
      'INSERT INTO slots (id, zone_id, name, status, is_accessible, is_ev) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, zoneId, name, 'AVAILABLE', !!isAccessible, !!isEV]
    );
    const s = rows[0];
    res.status(201).json({ id: s.id, zoneId: s.zone_id, name: s.name, status: s.status, isAccessible: s.is_accessible, isEV: s.is_ev });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/slots/:slotId/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE slots SET status = $1 WHERE id = $2', [status, req.params.slotId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/slots/:slotId', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM slots WHERE id = $1', [req.params.slotId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
