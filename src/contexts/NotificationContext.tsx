import React, { useCallback, useEffect, useState, createContext, useContext } from 'react';
import { Notification } from '../types';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: (role: string) => number;
  markAsRead: (id: string) => void;
  markAllAsRead: (role: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  getNotificationsForRole: (role: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('parksmart_token')) return;
    api.getNotifications()
      .then(setNotifications)
      .catch(() => {});
  }, []);

  // SSE real-time updates for notifications
  useEffect(() => {
    if (!localStorage.getItem('parksmart_token')) return;
    const es = new EventSource('/api/events');
    es.onmessage = (e) => {
      try {
        const { entity } = JSON.parse(e.data);
        if (entity === 'notifications') {
          api.getNotifications().then(setNotifications).catch(() => {});
        }
      } catch {}
    };
    return () => es.close();
  }, []);

  const getNotificationsForRole = useCallback((role: string): Notification[] =>
    notifications.filter((n) => n.targetRole === 'ALL' || n.targetRole === role),
    [notifications]
  );

  const unreadCount = useCallback((role: string): number =>
    getNotificationsForRole(role).filter((n) => !n.read).length,
    [getNotificationsForRole]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    api.markNotificationRead(id).catch(() => {});
  }, []);

  const markAllAsRead = useCallback((role: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.targetRole === 'ALL' || n.targetRole === role) ? { ...n, read: true } : n)
    );
    api.markAllRead(role).catch(() => {});
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const optimistic: Notification = {
        ...notification,
        id: `n_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [optimistic, ...prev]);

      if (notification.type === 'SUCCESS') toast.success(notification.title, { description: notification.message });
      else if (notification.type === 'ERROR') toast.error(notification.title, { description: notification.message });
      else if (notification.type === 'WARNING') toast.warning(notification.title, { description: notification.message });
      else toast.info(notification.title, { description: notification.message });

      api.addNotification({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        targetRole: notification.targetRole
      }).then((saved) => {
        setNotifications((prev) => prev.map((n) => n.id === optimistic.id ? saved : n));
      }).catch(() => {});
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification, getNotificationsForRole }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
