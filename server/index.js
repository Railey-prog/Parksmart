const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/permits', require('./routes/permits'));
app.use('/api/violations', require('./routes/violations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/logs', require('./routes/logs'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.API_PORT || 3001;

const seed = require('./seed');

pool.connect()
  .then(async (client) => {
    client.release();
    console.log('✓ Database connected');
    await seed();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ API server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  });
