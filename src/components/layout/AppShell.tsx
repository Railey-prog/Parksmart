import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  LayoutDashboard,
  Map,
  Calendar,
  CreditCard,
  Clock,
  User as UserIcon,
  Users,
  MapPin,
  BarChart3,
  ShieldCheck,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  AlertTriangle } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Badge } from '../common/Badge';
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}
export const AppShell: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  if (!user) return <>{children}</>;
  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'ADMIN':
        return [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { label: 'Zones & Slots', path: '/admin/zones', icon: <MapPin className="w-5 h-5" /> },
        { label: 'Permits', path: '/admin/permits', icon: <ShieldCheck className="w-5 h-5" /> },
        { label: 'Parking Activity', path: '/admin/logs', icon: <FileText className="w-5 h-5" /> },
        { label: 'Violations', path: '/admin/violations', icon: <AlertTriangle className="w-5 h-5" /> },
        { label: 'Reports & Stats', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> }];

      case 'USER':
        return [
        { label: 'Dashboard', path: '/user', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Parking Map', path: '/user/map', icon: <Map className="w-5 h-5" /> },
        { label: 'My Permit', path: '/user/permit', icon: <CreditCard className="w-5 h-5" /> }];

      case 'SECURITY':
        return [
        { label: 'Dashboard', path: '/security', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Verify Permit', path: '/security/verify', icon: <ShieldCheck className="w-5 h-5" /> },
        { label: 'My Reports', path: '/security/reports', icon: <AlertTriangle className="w-5 h-5" /> },
        { label: 'Activity Log', path: '/security/logs', icon: <FileText className="w-5 h-5" /> }];

      default:
        return [];
    }
  };
  const navItems = getNavItems();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const getRoleBadgeVariant = () => {
    if (user.role === 'ADMIN') return 'danger';
    if (user.role === 'SECURITY') return 'warning';
    return 'info';
  };
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-y-0 border-l-0 rounded-none z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            ParkSmart
          </span>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <Badge
                variant={getRoleBadgeVariant()}
                className="mt-1 text-[10px] px-1.5 py-0">
                
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item) =>
          <NavLink
            key={item.path}
            to={item.path}
            end={
            item.path === '/admin' ||
            item.path === '/user' ||
            item.path === '/security'
            }
            className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              isActive ?
              'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
              'text-slate-400 hover:text-white hover:bg-white/5'
            )
            }>
            
              {item.icon}
              {item.label}
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel border-x-0 border-t-0 rounded-none z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">ParkSmart</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-300">
            
            <Bell className="w-5 h-5" />
            {unreadCount > 0 &&
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            }
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300">
            
            {isMobileMenuOpen ?
            <X className="w-6 h-6" /> :

            <Menu className="w-6 h-6" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          className="md:hidden fixed inset-0 top-16 z-20 glass-panel rounded-none flex flex-col">
          
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) =>
            <NavLink
              key={item.path}
              to={item.path}
              end={
              item.path === '/admin' ||
              item.path === '/user' ||
              item.path === '/security'
              }
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-all',
                isActive ?
                'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                'text-slate-300 hover:bg-white/5'
              )
              }>
              
                  {item.icon}
                  {item.label}
                </NavLink>
            )}
              <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-4 rounded-xl text-base font-medium text-rose-400 hover:bg-rose-500/10">
              
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </motion.div>
        }
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 glass-panel border-x-0 border-t-0 rounded-none items-center justify-end px-8 z-10 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative">
              
              <Bell className="w-5 h-5" />
              {unreadCount > 0 &&
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
              }
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                className="absolute right-0 mt-2 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/95">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <Badge variant="neutral">{unreadCount} new</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto hide-scrollbar bg-slate-950/95">
                    {notifications.length === 0 ?
                  <div className="p-8 text-center text-slate-400 text-sm">
                        No notifications
                      </div> :

                  notifications.map((notif) =>
                  <div
                    key={notif.id}
                    className={clsx(
                      'p-4 border-b border-slate-800 hover:bg-slate-900/80 transition-colors cursor-pointer',
                      !notif.read && 'bg-slate-900/80'
                    )}
                    onClick={() => markAsRead(notif.id)}>
                    
                          <div className="flex items-start gap-3">
                            <div
                        className={clsx(
                          'w-2 h-2 rounded-full mt-1.5 shrink-0',
                          notif.type === 'SUCCESS' ?
                          'bg-emerald-500' :
                          notif.type === 'WARNING' ?
                          'bg-amber-500' :
                          notif.type === 'ERROR' ?
                          'bg-rose-500' :
                          'bg-cyan-500'
                        )} />
                      
                            <div>
                              <p className="text-sm font-medium text-white">
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-2">
                                {new Date(notif.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                              </p>
                            </div>
                          </div>
                        </div>
                  )
                  }
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -20
              }}
              transition={{
                duration: 0.3
              }}
              className="max-w-7xl mx-auto">
              
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>);

};