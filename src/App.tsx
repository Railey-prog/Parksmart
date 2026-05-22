import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { Toaster } from 'sonner';
// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ParkingProvider } from './contexts/ParkingContext';
// Layout
import { AppShell } from './components/layout/AppShell';
// Public Pages
import { Landing } from './pages/public/Landing';
import { Login, Register } from './pages/public/Auth';
import { RegistrationPending } from './pages/public/RegistrationPending';
// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UserMap } from './pages/user/UserMap';
import { UserPermit } from './pages/user/UserPermit';
import { UserReservations } from './pages/user/UserReservations';
import { UserHistory } from './pages/user/UserHistory';
import { UserProfile } from './pages/user/UserProfile';
// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminZones } from './pages/admin/AdminZones';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminPermits } from './pages/admin/AdminPermits';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminNotifications } from './pages/admin/AdminNotifications';
// Security Pages
import { SecurityDashboard } from './pages/security/SecurityDashboard';
import { VerifyPermit } from './pages/security/VerifyPermit';
import { SecurityMap } from './pages/security/SecurityMap';
import { SecurityLogs } from './pages/security/SecurityLogs';
import { Violations } from './pages/security/Violations';
// Protected Route Wrapper
const ProtectedRoute = ({
  children,
  allowedRoles



}: {children: React.ReactNode;allowedRoles: string[];}) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'SECURITY') return <Navigate to="/security" replace />;
    return <Navigate to="/user" replace />;
  }
  return <>{children}</>;
};
// Redirect already-authenticated users to their dashboard
// so they don't see the login/register page after a refresh.
const PublicOnlyRoute = ({ children }: {children: React.ReactNode;}) => {
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
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
        <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />
      
      <Route
        path="/register"
        element={
        <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        } />
      
      <Route path="/registration-pending" element={<RegistrationPending />} />

      {/* User Routes */}
      <Route
        path="/user/*"
        element={
        <ProtectedRoute allowedRoles={['USER']}>
            <AppShell>
              <Routes>
                <Route path="/" element={<UserDashboard />} />
                <Route path="/map" element={<UserMap />} />
                <Route path="/reservations" element={<UserReservations />} />
                <Route path="/permit" element={<UserPermit />} />
                <Route path="/history" element={<UserHistory />} />
                <Route path="/profile" element={<UserProfile />} />
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
                <Route path="/notifications" element={<AdminNotifications />} />
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
                <Route path="/map" element={<SecurityMap />} />
                <Route path="/logs" element={<SecurityLogs />} />
                <Route path="/violations" element={<Violations />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
      
    </Routes>);

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
    </AuthProvider>);

}