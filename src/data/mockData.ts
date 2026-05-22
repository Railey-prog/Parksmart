import {
  User,
  Zone,
  Slot,
  Reservation,
  Permit,
  LogEntry,
  Violation,
  Notification,
  SlotStatus } from
'../types';

export const mockUsers: User[] = [
{
  id: 'u1',
  name: 'Admin User',
  email: 'admin@parksmart.edu',
  role: 'ADMIN',
  status: 'APPROVED'
},
{
  id: 'u2',
  name: 'Jane Doe',
  email: 'jane.doe@parksmart.edu',
  role: 'USER',
  vehiclePlate: 'ABC-1234',
  vehicleModel: 'Toyota Camry',
  status: 'APPROVED'
},
{
  id: 'u3',
  name: 'Security Officer Bob',
  email: 'security@parksmart.edu',
  role: 'SECURITY',
  status: 'APPROVED'
},
{
  id: 'u4',
  name: 'John Smith',
  email: 'john.smith@parksmart.edu',
  role: 'USER',
  vehiclePlate: 'XYZ-9876',
  vehicleModel: 'Honda Civic',
  status: 'APPROVED'
},
{
  id: 'u5',
  name: 'Alice Johnson',
  email: 'alice.j@parksmart.edu',
  role: 'USER',
  vehiclePlate: 'EV-001',
  vehicleModel: 'Tesla Model 3',
  status: 'PENDING'
}];


const generateSlots = (
zoneId: string,
prefix: string,
count: number)
: Slot[] => {
  const slots: Slot[] = [];
  for (let i = 1; i <= count; i++) {
    const isAccessible = i <= 2;
    const isEV = i > 2 && i <= 4;

    // Randomize initial status
    const rand = Math.random();
    let status: SlotStatus = 'AVAILABLE';
    if (rand > 0.8) status = 'OCCUPIED';else
    if (rand > 0.7) status = 'RESERVED';else
    if (rand > 0.95) status = 'MAINTENANCE';

    slots.push({
      id: `s_${zoneId}_${i}`,
      zoneId,
      name: `${prefix}-${i.toString().padStart(2, '0')}`,
      status,
      isAccessible,
      isEV
    });
  }
  return slots;
};

export const mockZones: Zone[] = [
{
  id: 'z1',
  name: 'North Campus Lot',
  description: 'Main student parking near Science building',
  capacity: 24,
  slots: generateSlots('z1', 'N', 24)
},
{
  id: 'z2',
  name: 'South Faculty Garage',
  description: 'Covered parking for faculty and staff',
  capacity: 16,
  slots: generateSlots('z2', 'S', 16)
},
{
  id: 'z3',
  name: 'East Visitor Lot',
  description: 'Short-term visitor parking',
  capacity: 12,
  slots: generateSlots('z3', 'E', 12)
},
{
  id: 'z4',
  name: 'West Stadium Lot',
  description: 'Event and overflow parking',
  capacity: 32,
  slots: generateSlots('z4', 'W', 32)
}];


const now = new Date();
const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
const inTwoHours = new Date(now.getTime() + 120 * 60 * 1000);
const pastHour = new Date(now.getTime() - 60 * 60 * 1000);

export const mockReservations: Reservation[] = [
{
  id: 'r1',
  userId: 'u2',
  slotId: 's_z1_5',
  zoneId: 'z1',
  startTime: now.toISOString(),
  endTime: inOneHour.toISOString(),
  status: 'ACTIVE'
},
{
  id: 'r2',
  userId: 'u4',
  slotId: 's_z2_1',
  zoneId: 'z2',
  startTime: now.toISOString(),
  endTime: inTwoHours.toISOString(),
  status: 'ACTIVE'
},
{
  id: 'r3',
  userId: 'u2',
  slotId: 's_z1_2',
  zoneId: 'z1',
  startTime: pastHour.toISOString(),
  endTime: now.toISOString(),
  status: 'COMPLETED'
}];


export const mockPermits: Permit[] = [
{
  id: 'p1',
  userId: 'u2',
  permitNumber: 'PRM-2026-001',
  vehiclePlate: 'ABC-1234',
  issueDate: '2026-01-01T00:00:00Z',
  expiryDate: '2026-12-31T23:59:59Z',
  status: 'ACTIVE'
},
{
  id: 'p2',
  userId: 'u4',
  permitNumber: 'PRM-2026-002',
  vehiclePlate: 'XYZ-9876',
  issueDate: '2026-01-01T00:00:00Z',
  expiryDate: '2026-12-31T23:59:59Z',
  status: 'ACTIVE'
},
{
  id: 'p3',
  userId: 'u5',
  permitNumber: 'PRM-2026-003',
  vehiclePlate: 'EV-001',
  issueDate: '2026-05-20T00:00:00Z',
  expiryDate: '2026-12-31T23:59:59Z',
  status: 'PENDING'
}];


export const mockLogs: LogEntry[] = [
{
  id: 'l1',
  timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
  type: 'ENTRY',
  description: 'Vehicle entered North Campus Lot',
  vehiclePlate: 'ABC-1234',
  severity: 'INFO'
},
{
  id: 'l2',
  timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
  type: 'EXIT',
  description: 'Vehicle exited South Faculty Garage',
  vehiclePlate: 'DEF-5678',
  severity: 'INFO'
},
{
  id: 'l3',
  timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
  type: 'VIOLATION',
  description: 'Unauthorized parking in reserved slot',
  vehiclePlate: 'UNK-999',
  severity: 'WARNING'
},
{
  id: 'l4',
  timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
  type: 'SYSTEM',
  description: 'Zone 3 maintenance mode activated',
  severity: 'INFO'
}];


export const mockViolations: Violation[] = [
{
  id: 'v1',
  timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
  reportedBy: 'u3',
  vehiclePlate: 'UNK-999',
  description: 'Parked in EV spot without EV permit',
  status: 'OPEN',
  location: 'North Campus Lot (N-04)'
},
{
  id: 'v2',
  timestamp: new Date(now.getTime() - 24 * 60 * 60000).toISOString(),
  reportedBy: 'u3',
  vehiclePlate: 'XYZ-111',
  description: 'Expired permit',
  status: 'RESOLVED',
  location: 'East Visitor Lot'
}];


export const mockNotifications: Notification[] = [
{
  id: 'n1',
  userId: 'u2',
  title: 'Reservation Confirmed',
  message: 'Your reservation for N-05 is confirmed.',
  timestamp: now.toISOString(),
  read: false,
  type: 'SUCCESS'
},
{
  id: 'n2',
  userId: 'u2',
  title: 'Peak Hour Alert',
  message: 'Parking demand is high in North Campus Lot.',
  timestamp: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
  read: true,
  type: 'WARNING'
}];


export const analyticsData = {
  hourlyDemand: [
  { time: '6 AM', demand: 10 },
  { time: '8 AM', demand: 45 },
  { time: '10 AM', demand: 85 },
  { time: '12 PM', demand: 95 },
  { time: '2 PM', demand: 80 },
  { time: '4 PM', demand: 60 },
  { time: '6 PM', demand: 30 },
  { time: '8 PM', demand: 15 }],

  weeklyTrend: [
  { day: 'Mon', occupancy: 75 },
  { day: 'Tue', occupancy: 82 },
  { day: 'Wed', occupancy: 88 },
  { day: 'Thu', occupancy: 85 },
  { day: 'Fri', occupancy: 60 },
  { day: 'Sat', occupancy: 20 },
  { day: 'Sun', occupancy: 15 }],

  zoneUtilization: [
  { name: 'North', value: 85 },
  { name: 'South', value: 65 },
  { name: 'East', value: 40 },
  { name: 'West', value: 25 }]

};