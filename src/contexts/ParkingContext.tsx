import React, { useCallback, useEffect, useState, createContext, useContext } from 'react';
import { Zone, Slot, Reservation, Permit, LogEntry, Violation, User, SlotStatus } from '../types';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface ParkingContextType {
  zones: Zone[];
  reservations: Reservation[];
  permits: Permit[];
  logs: LogEntry[];
  violations: Violation[];
  users: User[];
  loading: boolean;
  refreshReservations: () => Promise<void>;
  reserveSlot: (userId: string, zoneId: string, slotId: string, durationMinutes: number) => void;
  cancelReservation: (reservationId: string) => void;
  updateSlotStatus: (zoneId: string, slotId: string, status: SlotStatus) => void;
  approveReservation: (reservationId: string) => void;
  approvePermit: (permitId: string) => void;
  revokePermit: (permitId: string) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  reportViolation: (violation: Omit<Violation, 'id' | 'timestamp' | 'status' | 'reportedBy' | 'reportedByName'>) => void;
  resolveViolation: (violationId: string) => void;
  updateViolationStatus: (violationId: string, status: 'OPEN' | 'RESOLVED') => void;
  deleteViolation: (violationId: string) => void;
  updateUserStatus: (userId: string, status: 'APPROVED' | 'REJECTED') => void;
  createUser: (user: Omit<User, 'id'>) => boolean;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  createZone: (zone: Omit<Zone, 'id' | 'slots'>) => void;
  updateZone: (id: string, data: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  createSlot: (zoneId: string, slot: Omit<Slot, 'id' | 'zoneId' | 'status'>) => void;
  deleteSlot: (zoneId: string, slotId: string) => void;
  requestPermit: (userId: string, vehiclePlate: string, vehicleModel?: string) => void;
  resetData: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!localStorage.getItem('parksmart_token')) {
      setLoading(false);
      return;
    }
    Promise.allSettled([
      api.getZones(),
      api.getReservations(),
      api.getPermits(),
      api.getLogs(),
      api.getViolations(),
      api.getUsers()
    ]).then(([z, r, p, l, v, u]) => {
      if (z.status === 'fulfilled') setZones(z.value); else console.error('Failed to load zones:', z.reason);
      if (r.status === 'fulfilled') setReservations(r.value); else console.error('Failed to load reservations:', r.reason);
      if (p.status === 'fulfilled') setPermits(p.value); else console.error('Failed to load permits:', p.reason);
      if (l.status === 'fulfilled') setLogs(l.value); else console.error('Failed to load logs:', l.reason);
      if (v.status === 'fulfilled') setViolations(v.value); else console.error('Failed to load violations:', v.reason);
      if (u.status === 'fulfilled') setUsers(u.value); else console.error('Failed to load users:', u.reason);
    }).finally(() => setLoading(false));
  }, []);

  // SSE real-time updates
  useEffect(() => {
    if (!localStorage.getItem('parksmart_token')) return;
    const es = new EventSource('/api/events');
    es.onmessage = (e) => {
      try {
        const { entity } = JSON.parse(e.data);
        if (entity === 'zones') api.getZones().then(setZones).catch(() => {});
        else if (entity === 'reservations') api.getReservations().then(setReservations).catch(() => {});
        else if (entity === 'permits') api.getPermits().then(setPermits).catch(() => {});
        else if (entity === 'logs') api.getLogs().then(setLogs).catch(() => {});
        else if (entity === 'violations') api.getViolations().then(setViolations).catch(() => {});
        else if (entity === 'users') api.getUsers().then(setUsers).catch(() => {});
      } catch {}
    };
    return () => es.close();
  }, []);

  // Reservation expiry check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setReservations((prev) => {
        let changed = false;
        const updated = prev.map((res) => {
          if (res.status === 'ACTIVE' && new Date(res.endTime) <= now) {
            changed = true;
            setZones((zPrev) =>
              zPrev.map((z) => z.id === res.zoneId
                ? { ...z, slots: z.slots.map((s) => s.id === res.slotId ? { ...s, status: 'AVAILABLE' } : s) }
                : z)
            );
            api.expireReservation(res.id).catch(() => {});
            addNotification({ userId: res.userId, title: 'Reservation Expired', message: 'Your parking reservation has expired.', type: 'WARNING', targetRole: 'USER' });
            return { ...res, status: 'EXPIRED' as const };
          }
          return res;
        });
        return changed ? updated : prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [addNotification]);

  const addLogInternal = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = { ...log, id: `l_${Date.now()}`, timestamp: new Date().toISOString() };
    setLogs((prev) => [newLog, ...prev]);
    api.addLog(log).catch(() => {});
  };

  const reserveSlot = useCallback((userId: string, zoneId: string, slotId: string, durationMinutes: number) => {
    api.createReservation({ userId, zoneId, slotId, durationMinutes }).then((res) => {
      setReservations((prev) => [res, ...prev]);
      setZones((prev) => prev.map((z) => z.id === zoneId
        ? { ...z, slots: z.slots.map((s) => s.id === slotId ? { ...s, status: 'RESERVED' } : s) }
        : z));
      addLogInternal({ type: 'SYSTEM', description: `Parking reserved – slot ${slotId}, zone ${zoneId}`, userId, severity: 'INFO' });
      addNotification({
        userId, title: 'Reservation Submitted',
        message: 'Your reservation is pending admin approval.',
        type: 'INFO', targetRole: 'USER'
      });
      addNotification({
        userId: 'system', title: 'New Reservation Request',
        message: `A new parking reservation is awaiting your approval.`,
        type: 'INFO', targetRole: 'ADMIN'
      });
    }).catch(() => toast.error('Failed to reserve slot'));
  }, [addNotification]);

  const approveReservation = useCallback((reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;
    setReservations((prev) => prev.map((r) => r.id === reservationId ? { ...r, status: 'ACTIVE' } : r));
    setZones((zPrev) => zPrev.map((z) => z.id === res.zoneId
      ? { ...z, slots: z.slots.map((s) => s.id === res.slotId ? { ...s, status: 'OCCUPIED' } : s) }
      : z));
    api.approveReservation(reservationId).catch(() => {});
    addNotification({
      userId: res.userId, title: 'Reservation Approved',
      message: 'Your reservation has been approved.',
      type: 'SUCCESS', targetRole: 'USER'
    });
    addLogInternal({ type: 'SYSTEM', description: `Reservation approved – slot ${res.slotId}, zone ${res.zoneId}`, userId: res.userId, severity: 'INFO' });
    toast.success('Reservation approved');
  }, [reservations, addNotification]);

  const cancelReservation = useCallback((reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;
    setReservations((prev) => prev.map((r) => r.id === reservationId ? { ...r, status: 'CANCELLED' } : r));
    if (res.status === 'ACTIVE' || res.status === 'PENDING') {
      setZones((zPrev) => zPrev.map((z) => z.id === res.zoneId
        ? { ...z, slots: z.slots.map((s) => s.id === res.slotId ? { ...s, status: 'AVAILABLE' } : s) }
        : z));
    }
    api.cancelReservation(reservationId).catch(() => {});
    addNotification({ userId: res.userId, title: 'Reservation Cancelled', message: 'Your parking reservation has been cancelled.', type: 'WARNING', targetRole: 'USER' });
  }, [reservations, addNotification]);

  const updateSlotStatus = useCallback((zoneId: string, slotId: string, status: SlotStatus) => {
    setZones((prev) => prev.map((z) => z.id === zoneId
      ? { ...z, slots: z.slots.map((s) => s.id === slotId ? { ...s, status } : s) }
      : z));
    api.updateSlotStatus(slotId, status).catch(() => {});
    toast.success(`Slot status updated to ${status}`);
  }, []);

  const approvePermit = useCallback((permitId: string) => {
    const permit = permits.find((p) => p.id === permitId);
    setPermits((prev) => prev.map((p) => p.id === permitId ? { ...p, status: 'ACTIVE' } : p));
    api.approvePermit(permitId).catch(() => {});
    if (permit) addNotification({ userId: permit.userId, title: 'Permit Approved', message: `Your parking permit (${permit.permitNumber}) has been approved.`, type: 'SUCCESS', targetRole: 'USER' });
    toast.success('Permit approved');
  }, [permits, addNotification]);

  const revokePermit = useCallback((permitId: string) => {
    const permit = permits.find((p) => p.id === permitId);
    setPermits((prev) => prev.map((p) => p.id === permitId ? { ...p, status: 'REVOKED' } : p));
    api.revokePermit(permitId).catch(() => {});
    if (permit) addNotification({ userId: permit.userId, title: 'Permit Revoked', message: `Your permit (${permit.permitNumber}) has been revoked.`, type: 'ERROR', targetRole: 'USER' });
    toast.error('Permit revoked');
  }, [permits, addNotification]);

  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    addLogInternal(log);
  }, []);

  const reportViolation = useCallback((violation: Omit<Violation, 'id' | 'timestamp' | 'status'>) => {
    api.reportViolation(violation).then((v) => {
      setViolations((prev) => [v, ...prev]);
      toast.success('Violation reported successfully');
      addNotification({ userId: 'system', title: 'Violation Reported', message: `A parking violation at ${violation.location} for vehicle ${violation.vehiclePlate}.`, type: 'WARNING', targetRole: 'ADMIN' });
    }).catch(() => toast.error('Failed to report violation'));
  }, [addNotification]);

  const resolveViolation = useCallback((violationId: string) => {
    setViolations((prev) => prev.map((v) => v.id === violationId ? { ...v, status: 'RESOLVED' } : v));
    api.resolveViolation(violationId).catch(() => {});
    toast.success('Violation marked as resolved');
  }, []);

  const updateViolationStatus = useCallback((violationId: string, status: 'OPEN' | 'RESOLVED') => {
    setViolations((prev) => prev.map((v) => v.id === violationId ? { ...v, status } : v));
    api.updateViolationStatus(violationId, status).catch(() => {
      toast.error('Failed to update violation status');
    });
    toast.success(`Violation marked as ${status.toLowerCase()}`);
  }, []);

  const deleteViolation = useCallback((violationId: string) => {
    setViolations((prev) => prev.filter((v) => v.id !== violationId));
    api.deleteViolation(violationId).catch(() => {
      toast.error('Failed to delete violation');
    });
    toast.success('Violation deleted');
  }, []);

  const updateUserStatus = useCallback((userId: string, status: 'APPROVED' | 'REJECTED') => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status } : u));
    api.updateUserStatus(userId, status).catch(() => {});
    toast.success(`User status updated to ${status}`);
  }, []);

  const createUser = useCallback((user: Omit<User, 'id'>): boolean => {
    if (users.some((u) => u.email === user.email)) { toast.error('A user with that email already exists'); return false; }
    if (users.some((u) => u.name === user.name)) { toast.error('A user with that name already exists'); return false; }
    api.createUser({ ...user, password: 'password' }).then((newUser) => {
      setUsers((prev) => [newUser, ...prev]);
      toast.success('User created successfully');
    }).catch(() => toast.error('Failed to create user'));
    return true;
  }, [users]);

  const updateUser = useCallback((id: string, data: Partial<User>) => {
    const target = users.find((u) => u.id === id);
    if (target?.role === 'ADMIN') { toast.error('Admin accounts cannot be edited'); return; }
    if (data.email && users.some((u) => u.email === data.email && u.id !== id)) { toast.error('Email already in use'); return; }
    if (data.name && users.some((u) => u.name === data.name && u.id !== id)) { toast.error('Name already in use'); return; }
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...data } : u));
    api.updateUser(id, data).catch(() => {});
    toast.success('User updated successfully');
  }, [users]);

  const deleteUser = useCallback((id: string) => {
    const target = users.find((u) => u.id === id);
    if (target?.role === 'ADMIN') { toast.error('Admin accounts cannot be deleted'); return; }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    api.deleteUser(id).then(() => {
      toast.success('User deleted');
    }).catch(() => {
      if (target) setUsers((prev) => [...prev, target]);
      toast.error('Failed to delete user');
    });
  }, [users]);

  const createZone = useCallback((zone: Omit<Zone, 'id' | 'slots'>) => {
    api.createZone(zone).then((newZone) => {
      setZones((prev) => [...prev, newZone]);
      toast.success('Zone created successfully');
    }).catch(() => toast.error('Failed to create zone'));
  }, []);

  const updateZone = useCallback((id: string, data: Partial<Zone>) => {
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, ...data } : z));
    api.updateZone(id, data).catch(() => {});
    toast.success('Zone updated successfully');
  }, []);

  const deleteZone = useCallback((id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    api.deleteZone(id).catch(() => {});
    toast.success('Zone deleted');
  }, []);

  const createSlot = useCallback((zoneId: string, slot: Omit<Slot, 'id' | 'zoneId' | 'status'>) => {
    api.createSlot(zoneId, slot).then((newSlot) => {
      setZones((prev) => prev.map((z) => z.id === zoneId ? { ...z, slots: [...z.slots, newSlot] } : z));
      toast.success('Slot added successfully');
    }).catch(() => toast.error('Failed to add slot'));
  }, []);

  const deleteSlot = useCallback((zoneId: string, slotId: string) => {
    setZones((prev) => prev.map((z) => z.id === zoneId ? { ...z, slots: z.slots.filter((s) => s.id !== slotId) } : z));
    api.deleteSlot(slotId).catch(() => {});
    toast.success('Slot deleted');
  }, []);

  const requestPermit = useCallback((userId: string, vehiclePlate: string) => {
    if (permits.some((p) => p.userId === userId && (p.status === 'ACTIVE' || p.status === 'PENDING'))) {
      toast.error('You already have an active or pending permit');
      return;
    }
    api.requestPermit({ userId, vehiclePlate }).then((newPermit) => {
      setPermits((prev) => [...prev, newPermit]);
      toast.success('Permit application submitted for admin review');
      addNotification({ userId: 'system', title: 'New Permit Application', message: `A user submitted a permit application for vehicle ${vehiclePlate}.`, type: 'INFO', targetRole: 'ADMIN' });
    }).catch((err) => {
      if (err.code === 'PERMIT_EXISTS') toast.error('You already have an active or pending permit');
      else toast.error('Failed to submit permit application');
    });
  }, [permits, addNotification]);

  const refreshReservations = useCallback(async () => {
    try {
      const data = await api.getReservations();
      setReservations(data);
    } catch {
      toast.error('Failed to refresh reservations');
    }
  }, []);

  const resetData = useCallback(() => {
    toast.info('Reload the page to re-seed data from the database.');
  }, []);

  return (
    <ParkingContext.Provider value={{
      zones, reservations, permits, logs, violations, users, loading,
      refreshReservations, reserveSlot, cancelReservation, updateSlotStatus,
      approveReservation, approvePermit, revokePermit, addLog, reportViolation, resolveViolation,
      updateUserStatus, createUser, updateUser, deleteUser,
      createZone, updateZone, deleteZone, createSlot, deleteSlot,
      requestPermit, resetData, updateViolationStatus, deleteViolation
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) throw new Error('useParking must be used within a ParkingProvider');
  return context;
};
