import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext } from
'react';
import { Notification } from '../types';
import { mockNotifications } from '../data/mockData';
import { toast } from 'sonner';
import { loadFromStorage, saveToStorage } from '../lib/storage';
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>)
  => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);
export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() =>
  loadFromStorage('notifications', mockNotifications)
  );
  useEffect(() => {
    saveToStorage('notifications', notifications);
  }, [notifications]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
    prev.map((n) =>
    n.id === id ?
    {
      ...n,
      read: true
    } :
    n
    )
    );
  }, []);
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
    prev.map((n) => ({
      ...n,
      read: true
    }))
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
      // Also show a toast
      if (notification.type === 'SUCCESS')
      toast.success(notification.title, {
        description: notification.message
      });else
      if (notification.type === 'ERROR')
      toast.error(notification.title, {
        description: notification.message
      });else
      if (notification.type === 'WARNING')
      toast.warning(notification.title, {
        description: notification.message
      });else

      toast.info(notification.title, {
        description: notification.message
      });
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
        addNotification
      }}>
      
      {children}
    </NotificationContext.Provider>);

};
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};