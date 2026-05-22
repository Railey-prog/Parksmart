const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const { addClient, broadcast } = require('./broadcaster');

const ENTITY_MAP = {
  '/api/users': 'users',
  '/api/zones': 'zones',
  '/api/reservations': 'reservations',
  '/api/permits': 'permits',
  '/api/violations': 'violations',
  '/api/notifications': 'notifications',
  '/api/logs': 'logs',
};

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    const entity = Object.entries(ENTITY_MAP).find(([prefix]) => req.path.startsWith(prefix.replace('/api', '')))?.[1];
    if (entity) {
      const originalJson = res.json.bind(res);
      res.json = function (data) {
        const result = originalJson(data);
        if (res.statusCode >= 200 && res.statusCode < 300) broadcast(entity);
        return result;
      };
    }
  }
  next();
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  addClient(res);
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
  }, 20000);
  res.on('close', () => clearInterval(heartbeat));
});

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
