import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext } from 'react';
import { Notification } from '../types';
import { mockNotifications } from '../data/mockData';
import { toast } from 'sonner';
import { loadFromStorage, saveToStorage } from '../lib/storage';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: (role: string) => number;
  markAsRead: (id: string) => void;
  markAllAsRead: (role: string) => void;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void;
  getNotificationsForRole: (role: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage('notifications', mockNotifications)
  );

  useEffect(() => {
    saveToStorage('notifications', notifications);
  }, [notifications]);

  const getNotificationsForRole = useCallback((role: string): Notification[] => {
    return notifications.filter(
      (n) => n.targetRole === 'ALL' || n.targetRole === role
    );
  }, [notifications]);

  const unreadCount = useCallback((role: string): number => {
    return getNotificationsForRole(role).filter((n) => !n.read).length;
  }, [getNotificationsForRole]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback((role: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        (n.targetRole === 'ALL' || n.targetRole === role) ? { ...n, read: true } : n
      )
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `n_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [newNotification, ...prev]);

      if (notification.type === 'SUCCESS')
        toast.success(notification.title, { description: notification.message });
      else if (notification.type === 'ERROR')
        toast.error(notification.title, { description: notification.message });
      else if (notification.type === 'WARNING')
        toast.warning(notification.title, { description: notification.message });
      else
        toast.info(notification.title, { description: notification.message });
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        getNotificationsForRole
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
