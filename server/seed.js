const bcrypt = require('bcryptjs');
const pool = require('./db');

const DEFAULT_PASSWORD = 'password';

const ZONES = [
  { id: 'z1', name: 'North Campus Lot', description: 'Main student parking near Science building', capacity: 24 },
  { id: 'z2', name: 'South Faculty Garage', description: 'Covered parking for faculty and staff', capacity: 16 },
  { id: 'z3', name: 'East Visitor Lot', description: 'Short-term visitor parking', capacity: 12 },
  { id: 'z4', name: 'West Stadium Lot', description: 'Event and overflow parking', capacity: 32 },
];

const ZONE_SLOTS = {
  z1: { prefix: 'N', count: 24 },
  z2: { prefix: 'S', count: 16 },
  z3: { prefix: 'E', count: 12 },
  z4: { prefix: 'W', count: 32 },
};

const USERS = [
  { id: 'u1', name: 'Admin User', email: 'admin@parksmart.edu', role: 'ADMIN', status: 'APPROVED' },
  { id: 'u2', name: 'Jane Doe', email: 'jane.doe@parksmart.edu', role: 'USER', status: 'APPROVED', vehicle_plate: 'ABC-1234', vehicle_model: 'Toyota Camry' },
  { id: 'u3', name: 'Security Officer Bob', email: 'security@parksmart.edu', role: 'SECURITY', status: 'APPROVED' },
  { id: 'u4', name: 'John Smith', email: 'john.smith@parksmart.edu', role: 'USER', status: 'APPROVED', vehicle_plate: 'XYZ-9876', vehicle_model: 'Honda Civic' },
  { id: 'u5', name: 'Alice Johnson', email: 'alice.j@parksmart.edu', role: 'USER', status: 'APPROVED', vehicle_plate: 'EV-001', vehicle_model: 'Tesla Model 3' },
];

module.exports = async function seed() {
  const { rows: existingUsers } = await pool.query('SELECT id FROM users LIMIT 1');
  if (existingUsers.length > 0) {
    console.log('✓ Database already seeded');
    return;
  }

  console.log('Seeding database...');
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const u of USERS) {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, vehicle_plate, vehicle_model)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.name, u.email, hash, u.role, u.status, u.vehicle_plate || null, u.vehicle_model || null]
    );
  }

  for (const z of ZONES) {
    await pool.query(
      'INSERT INTO zones (id, name, description, capacity) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
      [z.id, z.name, z.description, z.capacity]
    );
    const { prefix, count } = ZONE_SLOTS[z.id];
    const STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'];
    for (let i = 1; i <= count; i++) {
      const id = `s_${z.id}_${i}`;
      const name = `${prefix}-${String(i).padStart(2, '0')}`;
      const isAccessible = i <= 2;
      const isEV = i > 2 && i <= 4;
      const status = i === 5 ? 'OCCUPIED' : i === 6 ? 'RESERVED' : STATUSES[i % STATUSES.length];
      await pool.query(
        'INSERT INTO slots (id, zone_id, name, status, is_accessible, is_ev) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [id, z.id, name, status, isAccessible, isEV]
      );
    }
  }

  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  const inTwoHours = new Date(now.getTime() + 120 * 60 * 1000);
  const pastHour = new Date(now.getTime() - 60 * 60 * 1000);

  const reservations = [
    { id: 'r1', user_id: 'u2', slot_id: 's_z1_5', zone_id: 'z1', start: now, end: inOneHour, status: 'ACTIVE' },
    { id: 'r2', user_id: 'u4', slot_id: 's_z2_1', zone_id: 'z2', start: now, end: inTwoHours, status: 'ACTIVE' },
    { id: 'r3', user_id: 'u2', slot_id: 's_z1_2', zone_id: 'z1', start: pastHour, end: now, status: 'COMPLETED' },
  ];
  for (const r of reservations) {
    await pool.query(
      `INSERT INTO reservations (id, user_id, slot_id, zone_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [r.id, r.user_id, r.slot_id, r.zone_id, r.start, r.end, r.status]
    );
  }

  const permits = [
    { id: 'p1', user_id: 'u2', permit_number: 'PRM-2026-001', vehicle_plate: 'ABC-1234', issue: '2026-01-01', expiry: '2026-12-31', status: 'ACTIVE' },
    { id: 'p2', user_id: 'u4', permit_number: 'PRM-2026-002', vehicle_plate: 'XYZ-9876', issue: '2026-01-01', expiry: '2026-12-31', status: 'ACTIVE' },
  ];
  for (const p of permits) {
    await pool.query(
      `INSERT INTO permits (id, user_id, permit_number, vehicle_plate, issue_date, expiry_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.user_id, p.permit_number, p.vehicle_plate, p.issue, p.expiry, p.status]
    );
  }

  const violations = [
    { id: 'v1', reported_by: 'u3', vehicle_plate: 'UNK-999', description: 'Parked in EV spot without EV permit', status: 'OPEN', location: 'North Campus Lot (N-04)', ts: new Date(now.getTime() - 30 * 60000) },
    { id: 'v2', reported_by: 'u3', vehicle_plate: 'XYZ-111', description: 'Expired permit', status: 'RESOLVED', location: 'East Visitor Lot', ts: new Date(now.getTime() - 24 * 60 * 60000) },
  ];
  for (const v of violations) {
    await pool.query(
      `INSERT INTO violations (id, timestamp, reported_by, vehicle_plate, description, status, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [v.id, v.ts, v.reported_by, v.vehicle_plate, v.description, v.status, v.location]
    );
  }

  const logs = [
    { id: 'l1', type: 'ENTRY', description: 'Vehicle entered North Campus Lot', vehicle_plate: 'ABC-1234', severity: 'INFO', ts: new Date(now.getTime() - 5 * 60000) },
    { id: 'l2', type: 'EXIT', description: 'Vehicle exited South Faculty Garage', vehicle_plate: 'DEF-5678', severity: 'INFO', ts: new Date(now.getTime() - 15 * 60000) },
    { id: 'l3', type: 'VIOLATION', description: 'Unauthorized parking in reserved slot', vehicle_plate: 'UNK-999', severity: 'WARNING', ts: new Date(now.getTime() - 30 * 60000) },
    { id: 'l4', type: 'SYSTEM', description: 'Zone 3 maintenance mode activated', severity: 'INFO', ts: new Date(now.getTime() - 60 * 60000) },
  ];
  for (const l of logs) {
    await pool.query(
      `INSERT INTO logs (id, timestamp, type, description, user_id, vehicle_plate, severity)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [l.id, l.ts, l.type, l.description, l.user_id || null, l.vehicle_plate || null, l.severity]
    );
  }

  const notifications = [
    { id: 'n1', user_id: 'u2', title: 'Reservation Confirmed', message: 'Your reservation for N-05 is confirmed.', type: 'SUCCESS', target_role: 'USER', read: false },
    { id: 'n2', user_id: 'u2', title: 'Peak Hour Alert', message: 'Parking demand is high in North Campus Lot.', type: 'WARNING', target_role: 'ALL', read: true },
    { id: 'n3', user_id: 'system', title: 'New Permit Application', message: 'A new permit application is waiting for your review.', type: 'INFO', target_role: 'ADMIN', read: false },
    { id: 'n4', user_id: 'system', title: 'Violation Reported', message: 'A new parking violation has been reported at North Campus Lot.', type: 'WARNING', target_role: 'SECURITY', read: false },
  ];
  for (const n of notifications) {
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, timestamp, read, type, target_role)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [n.id, n.user_id, n.title, n.message, n.read, n.type, n.target_role]
    );
  }

  console.log('✓ Database seeded with demo data');
  console.log('  Login with any demo email + password: "password"');
};
