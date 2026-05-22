import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ParkingProvider } from './contexts/ParkingContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/public/Auth';
// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminZones } from './pages/admin/AdminZones';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminPermits } from './pages/admin/AdminPermits';
import { AdminLogs } from './pages/admin/AdminLogs';
// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UserMap } from './pages/user/UserMap';
import { UserPermit } from './pages/user/UserPermit';
// Security Pages
import { SecurityDashboard } from './pages/security/SecurityDashboard';
import { VerifyPermit } from './pages/security/VerifyPermit';
import { SecurityLogs } from './pages/security/SecurityLogs';

const ProtectedRoute = ({
  children,
  allowedRoles
}: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'SECURITY') return <Navigate to="/security" replace />;
    return <Navigate to="/user" replace />;
  }
  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'SECURITY') return <Navigate to="/security" replace />;
    return <Navigate to="/user" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />

      {/* User Routes */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <AppShell>
              <Routes>
                <Route path="/" element={<UserDashboard />} />
                <Route path="/map" element={<UserMap />} />
                <Route path="/permit" element={<UserPermit />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppShell>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/zones" element={<AdminZones />} />
                <Route path="/analytics" element={<AdminAnalytics />} />
                <Route path="/permits" element={<AdminPermits />} />
                <Route path="/logs" element={<AdminLogs />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />

      {/* Security Routes */}
      <Route
        path="/security/*"
        element={
          <ProtectedRoute allowedRoles={['SECURITY']}>
            <AppShell>
              <Routes>
                <Route path="/" element={<SecurityDashboard />} />
                <Route path="/verify" element={<VerifyPermit />} />
                <Route path="/logs" element={<SecurityLogs />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ParkingProvider>
          <Router>
            <AppRoutes />
            <Toaster theme="dark" position="top-right" />
          </Router>
        </ParkingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
