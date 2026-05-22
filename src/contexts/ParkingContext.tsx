import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext } from
'react';
import {
  Zone,
  Slot,
  Reservation,
  Permit,
  LogEntry,
  Violation,
  User,
  SlotStatus } from
'../types';
import {
  mockZones,
  mockReservations,
  mockPermits,
  mockLogs,
  mockViolations,
  mockUsers } from
'../data/mockData';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';
import { loadFromStorage, saveToStorage, clearAllStorage } from '../lib/storage';
interface ParkingContextType {
  zones: Zone[];
  reservations: Reservation[];
  permits: Permit[];
  logs: LogEntry[];
  violations: Violation[];
  users: User[];
  // Actions
  reserveSlot: (
  userId: string,
  zoneId: string,
  slotId: string,
  durationMinutes: number)
  => void;
  cancelReservation: (reservationId: string) => void;
  updateSlotStatus: (zoneId: string, slotId: string, status: SlotStatus) => void;
  approvePermit: (permitId: string) => void;
  revokePermit: (permitId: string) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  reportViolation: (
  violation: Omit<Violation, 'id' | 'timestamp' | 'status'>)
  => void;
  resolveViolation: (violationId: string) => void;
  updateUserStatus: (userId: string, status: 'APPROVED' | 'REJECTED') => void;
  // New Admin Actions
  createUser: (user: Omit<User, 'id'>) => boolean;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  createZone: (zone: Omit<Zone, 'id' | 'slots'>) => void;
  updateZone: (id: string, data: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  createSlot: (
  zoneId: string,
  slot: Omit<Slot, 'id' | 'zoneId' | 'status'>)
  => void;
  deleteSlot: (zoneId: string, slotId: string) => void;
  requestPermit: (userId: string, vehiclePlate: string, vehicleModel?: string) => void;
  resetData: () => void;
}
const ParkingContext = createContext<ParkingContextType | undefined>(undefined);
export const ParkingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [zones, setZones] = useState<Zone[]>(() =>
  loadFromStorage('zones', mockZones)
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
  loadFromStorage('reservations', mockReservations)
  );
  const [permits, setPermits] = useState<Permit[]>(() =>
  loadFromStorage('permits', mockPermits)
  );
  const [logs, setLogs] = useState<LogEntry[]>(() =>
  loadFromStorage('logs', mockLogs)
  );
  const [violations, setViolations] = useState<Violation[]>(() =>
  loadFromStorage('violations', mockViolations)
  );
  const [users, setUsers] = useState<User[]>(() =>
  loadFromStorage('users', mockUsers)
  );
  const { addNotification } = useNotifications();
  // Persist every state slice to localStorage when it changes
  useEffect(() => { saveToStorage('zones', zones); }, [zones]);
  useEffect(() => { saveToStorage('reservations', reservations); }, [reservations]);
  useEffect(() => { saveToStorage('permits', permits); }, [permits]);
  useEffect(() => { saveToStorage('logs', logs); }, [logs]);
  useEffect(() => { saveToStorage('violations', violations); }, [violations]);
  useEffect(() => { saveToStorage('users', users); }, [users]);

  // Cross-tab sync: when another tab writes to localStorage (e.g. admin approves a permit),
  // re-read the updated values into this tab's state so both tabs stay in sync.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        const value = JSON.parse(e.newValue);
        if (e.key === 'parksmart_db_permits') setPermits(value);
        else if (e.key === 'parksmart_db_zones') setZones(value);
        else if (e.key === 'parksmart_db_reservations') setReservations(value);
        else if (e.key === 'parksmart_db_logs') setLogs(value);
        else if (e.key === 'parksmart_db_violations') setViolations(value);
        else if (e.key === 'parksmart_db_users') setUsers(value);
      } catch {
        // ignore malformed entries
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  // Simulate real-time updates and reservation expirations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Check for expired reservations
      setReservations((prev) => {
        let changed = false;
        const updated = prev.map((res) => {
          if (res.status === 'ACTIVE' && new Date(res.endTime) <= now) {
            changed = true;
            // Update slot status back to available
            setZones((zPrev) =>
            zPrev.map((z) =>
            z.id === res.zoneId ?
            {
              ...z,
              slots: z.slots.map((s) =>
              s.id === res.slotId ?
              {
                ...s,
                status: 'AVAILABLE'
              } :
              s
              )
            } :
            z
            )
            );
            addNotification({
              userId: res.userId,
              title: 'Reservation Expired',
              message: 'Your parking reservation has expired.',
              type: 'WARNING',
              targetRole: 'USER'
            });
            return {
              ...res,
              status: 'EXPIRED'
            };
          }
          return res;
        });
        return changed ? updated : prev;
      });
      // Randomly flip a slot status occasionally to simulate live activity (only for non-reserved slots)
      if (Math.random() > 0.8) {
        setZones((prev) => {
          const newZones = [...prev];
          const randomZoneIdx = Math.floor(Math.random() * newZones.length);
          const zone = newZones[randomZoneIdx];
          const randomSlotIdx = Math.floor(Math.random() * zone.slots.length);
          const slot = zone.slots[randomSlotIdx];
          if (slot.status === 'AVAILABLE' || slot.status === 'OCCUPIED') {
            const newStatus =
            slot.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
            // Log the entry/exit
            if (newStatus === 'OCCUPIED') {
              addLogInternal({
                type: 'ENTRY',
                description: `Vehicle entered ${zone.name} (${slot.name})`,
                severity: 'INFO'
              });
            } else {
              addLogInternal({
                type: 'EXIT',
                description: `Vehicle exited ${zone.name} (${slot.name})`,
                severity: 'INFO'
              });
            }
            zone.slots[randomSlotIdx] = {
              ...slot,
              status: newStatus
            };
          }
          return newZones;
        });
      }
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [addNotification]);
  const addLogInternal = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setLogs((prev) => [newLog, ...prev]);
  };
  const reserveSlot = useCallback(
    (
    userId: string,
    zoneId: string,
    slotId: string,
    durationMinutes: number) =>
    {
      const now = new Date();
      const endTime = new Date(now.getTime() + durationMinutes * 60000);
      const newReservation: Reservation = {
        id: `r_${Date.now()}`,
        userId,
        zoneId,
        slotId,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        status: 'ACTIVE'
      };
      setReservations((prev) => [newReservation, ...prev]);
      setZones((prev) =>
      prev.map((z) =>
      z.id === zoneId ?
      {
        ...z,
        slots: z.slots.map((s) =>
        s.id === slotId ?
        {
          ...s,
          status: 'RESERVED'
        } :
        s
        )
      } :
      z
      )
      );
      addLogInternal({
        type: 'SYSTEM',
        description: `Slot ${slotId} reserved by user ${userId}`,
        userId,
        severity: 'INFO'
      });
      addNotification({
        userId,
        title: 'Reservation Confirmed',
        message: `Your parking slot is reserved until ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Check your dashboard for details.`,
        type: 'SUCCESS',
        targetRole: 'USER'
      });
    },
    [addNotification]
  );
  const cancelReservation = useCallback((reservationId: string) => {
    setReservations((prev) => {
      const res = prev.find((r) => r.id === reservationId);
      if (res && res.status === 'ACTIVE') {
        // Free up the slot
        setZones((zPrev) =>
        zPrev.map((z) =>
        z.id === res.zoneId ?
        {
          ...z,
          slots: z.slots.map((s) =>
          s.id === res.slotId ?
          {
            ...s,
            status: 'AVAILABLE'
          } :
          s
          )
        } :
        z
        )
        );
        toast.success('Reservation Cancelled');
        addNotification({
          userId: res.userId,
          title: 'Reservation Cancelled',
          message: 'Your parking reservation has been cancelled and the slot is now available.',
          type: 'WARNING',
          targetRole: 'USER'
        });
        return prev.map((r) =>
        r.id === reservationId ?
        {
          ...r,
          status: 'CANCELLED'
        } :
        r
        );
      }
      return prev;
    });
  }, [addNotification]);
  const updateSlotStatus = useCallback(
    (zoneId: string, slotId: string, status: SlotStatus) => {
      setZones((prev) =>
      prev.map((z) =>
      z.id === zoneId ?
      {
        ...z,
        slots: z.slots.map((s) =>
        s.id === slotId ?
        {
          ...s,
          status
        } :
        s
        )
      } :
      z
      )
      );
      toast.success(`Slot status updated to ${status}`);
    },
    []
  );
  const approvePermit = useCallback((permitId: string) => {
    setPermits((prev) => {
      const permit = prev.find((p) => p.id === permitId);
      if (permit) {
        addNotification({
          userId: permit.userId,
          title: 'Permit Approved',
          message: `Your parking permit (${permit.permitNumber}) has been approved and is now active.`,
          type: 'SUCCESS',
          targetRole: 'USER'
        });
      }
      return prev.map((p) => p.id === permitId ? { ...p, status: 'ACTIVE' } : p);
    });
    toast.success('Permit approved');
  }, [addNotification]);
  const revokePermit = useCallback((permitId: string) => {
    setPermits((prev) => {
      const permit = prev.find((p) => p.id === permitId);
      if (permit) {
        addNotification({
          userId: permit.userId,
          title: 'Permit Revoked',
          message: `Your parking permit (${permit.permitNumber}) has been revoked. Contact the admin for more information.`,
          type: 'ERROR',
          targetRole: 'USER'
        });
      }
      return prev.map((p) => p.id === permitId ? { ...p, status: 'REVOKED' } : p);
    });
    toast.error('Permit revoked');
  }, [addNotification]);
  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    addLogInternal(log);
  }, []);
  const reportViolation = useCallback(
    (violation: Omit<Violation, 'id' | 'timestamp' | 'status'>) => {
      const newViolation: Violation = {
        ...violation,
        id: `v_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'OPEN'
      };
      setViolations((prev) => [newViolation, ...prev]);
      toast.success('Violation reported successfully');
      addNotification({
        userId: 'system',
        title: 'Violation Reported',
        message: `A parking violation has been filed at ${violation.location} for vehicle ${violation.vehiclePlate}.`,
        type: 'WARNING',
        targetRole: 'ADMIN'
      });
    },
    [addNotification]
  );
  const resolveViolation = useCallback((violationId: string) => {
    setViolations((prev) =>
    prev.map((v) =>
    v.id === violationId ?
    {
      ...v,
      status: 'RESOLVED'
    } :
    v
    )
    );
    toast.success('Violation marked as resolved');
  }, []);
  const updateUserStatus = useCallback(
    (userId: string, status: 'APPROVED' | 'REJECTED') => {
      setUsers((prev) =>
      prev.map((u) =>
      u.id === userId ?
      {
        ...u,
        status
      } :
      u
      )
      );
      toast.success(`User status updated to ${status}`);
    },
    []
  );
  const createUser = useCallback((user: Omit<User, 'id'>) => {
    let created = false;
    setUsers((prev) => {
      // prevent duplicate email or name
      if (prev.some((u) => u.email === user.email)) {
        toast.error('A user with that email already exists');
        return prev;
      }
      if (prev.some((u) => u.name === user.name)) {
        toast.error('A user with that name already exists');
        return prev;
      }
      const newUser: User = {
        ...user,
        id: `u_${Date.now()}`
      };
      created = true;
      toast.success('User created successfully');
      return [newUser, ...prev];
    });
    return created;
  }, []);
  const updateUser = useCallback((id: string, data: Partial<User>) => {
    setUsers((prev) => {
      const userToUpdate = prev.find((u) => u.id === id);
      if (userToUpdate?.role === 'ADMIN') {
        toast.error('Admin accounts cannot be edited');
        return prev;
      }
      // prevent duplicates when updating
      if (data.email && prev.some((u) => u.email === data.email && u.id !== id)) {
        toast.error('Email already in use');
        return prev;
      }
      if (data.name && prev.some((u) => u.name === data.name && u.id !== id)) {
        toast.error('Name already in use');
        return prev;
      }
      toast.success('User updated successfully');
      return prev.map((u) =>
      u.id === id ?
      {
        ...u,
        ...data
      } :
      u
      );
    });
  }, []);
  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => {
      const userToDelete = prev.find((u) => u.id === id);
      if (userToDelete?.role === 'ADMIN') {
        toast.error('Admin accounts cannot be deleted');
        return prev;
      }
      toast.success('User deleted');
      return prev.filter((u) => u.id !== id);
    });
  }, []);
  const createZone = useCallback((zone: Omit<Zone, 'id' | 'slots'>) => {
    const newZone: Zone = {
      ...zone,
      id: `z_${Date.now()}`,
      slots: []
    };
    setZones((prev) => [...prev, newZone]);
    toast.success('Zone created successfully');
  }, []);
  const updateZone = useCallback((id: string, data: Partial<Zone>) => {
    setZones((prev) =>
    prev.map((z) =>
    z.id === id ?
    {
      ...z,
      ...data
    } :
    z
    )
    );
    toast.success('Zone updated successfully');
  }, []);
  const deleteZone = useCallback((id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    toast.success('Zone deleted');
  }, []);
  const createSlot = useCallback(
    (zoneId: string, slot: Omit<Slot, 'id' | 'zoneId' | 'status'>) => {
      const newSlot: Slot = {
        ...slot,
        id: `s_${Date.now()}`,
        zoneId,
        status: 'AVAILABLE'
      };
      setZones((prev) =>
      prev.map((z) =>
      z.id === zoneId ?
      {
        ...z,
        slots: [...z.slots, newSlot]
      } :
      z
      )
      );
      toast.success('Slot added successfully');
    },
    []
  );
  const deleteSlot = useCallback((zoneId: string, slotId: string) => {
    setZones((prev) =>
    prev.map((z) =>
    z.id === zoneId ?
    {
      ...z,
      slots: z.slots.filter((s) => s.id !== slotId)
    } :
    z
    )
    );
    toast.success('Slot deleted');
  }, []);
  const requestPermit = useCallback((userId: string, vehiclePlate: string, vehicleModel?: string) => {
    setPermits((prev) => {
      if (prev.some((p) => p.userId === userId && (p.status === 'ACTIVE' || p.status === 'PENDING'))) {
        toast.error('You already have an active or pending permit');
        return prev;
      }
      const newPermit: Permit = {
        id: `p_${Date.now()}`,
        userId,
        permitNumber: `PRM-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        vehiclePlate,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).toISOString(),
        status: 'PENDING'
      };
      toast.success('Permit application submitted for admin review');
      addNotification({
        userId: 'system',
        title: 'New Permit Application',
        message: `A user has submitted a permit application for vehicle ${vehiclePlate}. Review it in the Permits section.`,
        type: 'INFO',
        targetRole: 'ADMIN'
      });
      return [...prev, newPermit];
    });
  }, [addNotification]);
  const resetData = useCallback(() => {
    clearAllStorage();
    setZones(mockZones);
    setReservations(mockReservations);
    setPermits(mockPermits);
    setLogs(mockLogs);
    setViolations(mockViolations);
    setUsers(mockUsers);
    toast.success('Demo data reset to defaults');
  }, []);
  return (
    <ParkingContext.Provider
      value={{
        zones,
        reservations,
        permits,
        logs,
        violations,
        users,
        reserveSlot,
        cancelReservation,
        updateSlotStatus,
        approvePermit,
        revokePermit,
        addLog,
        reportViolation,
        resolveViolation,
        updateUserStatus,
        createUser,
        updateUser,
        deleteUser,
        createZone,
        updateZone,
        deleteZone,
        createSlot,
        deleteSlot,
        requestPermit,
        resetData
      }}>
      
      {children}
    </ParkingContext.Provider>);

};
export const useParking = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};