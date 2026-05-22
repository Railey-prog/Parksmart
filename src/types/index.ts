export type Role = 'ADMIN' | 'USER' | 'SECURITY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface Slot {
  id: string;
  zoneId: string;
  name: string;
  status: SlotStatus;
  isAccessible: boolean;
  isEV: boolean;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  capacity: number;
  slots: Slot[];
}

export interface Reservation {
  id: string;
  userId: string;
  slotId: string;
  zoneId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
}

export interface Permit {
  id: string;
  userId: string;
  permitNumber: string;
  vehiclePlate: string;
  issueDate: string;
  expiryDate: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'ENTRY' | 'EXIT' | 'SYSTEM' | 'VIOLATION';
  description: string;
  userId?: string;
  vehiclePlate?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

export interface Violation {
  id: string;
  timestamp: string;
  reportedBy: string;
  reportedByName?: string;
  vehiclePlate: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  location: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  targetRole: 'ADMIN' | 'USER' | 'SECURITY' | 'ALL';
}
