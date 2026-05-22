import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ParkingProvider } from './contexts/ParkingContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/public/Auth';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminZones } from './pages/admin/AdminZones';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminPermits } from './pages/admin/AdminPermits';
import { AdminLogs } from './pages/admin/AdminLogs';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
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

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
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
