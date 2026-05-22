const express = require('express');
const cors = require('cors');
const path = require('path');
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

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.NODE_ENV === 'production'
  ? (process.env.PORT || 5000)
  : (process.env.API_PORT || 3001);

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
