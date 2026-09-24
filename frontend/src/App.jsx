// =============================================
// src/App.jsx
// Main App - Routing setup
// =============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages import
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import TeamLeaves from './pages/TeamLeaves';
import TeamMembers from './pages/TeamMembers';
import AllLeaves from './pages/AllLeaves';
import Employees from './pages/Employees';
import Profile from './pages/Profile';

// ---- Protected Route ----
// Redirect unauthenticated users to login page
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Role check (if allowed roles are specified)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// ---- App Routes ----
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" />} />

      {/* Protected Routes - All authenticated users */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/my-leaves" element={<PrivateRoute><MyLeaves /></PrivateRoute>} />

      {/* Employee + Manager */}
      <Route path="/apply-leave" element={
        <PrivateRoute roles={['employee', 'manager']}><ApplyLeave /></PrivateRoute>
      } />

      {/* Manager only */}
      <Route path="/team-leaves" element={
        <PrivateRoute roles={['manager', 'admin']}><TeamLeaves /></PrivateRoute>
      } />
      <Route path="/team-members" element={
        <PrivateRoute roles={['manager', 'admin']}><TeamMembers /></PrivateRoute>
      } />

      {/* Admin only */}
      <Route path="/all-leaves" element={
        <PrivateRoute roles={['admin']}><AllLeaves /></PrivateRoute>
      } />
      <Route path="/employees" element={
        <PrivateRoute roles={['admin']}><Employees /></PrivateRoute>
      } />
      <Route path="/add-employee" element={
        <PrivateRoute roles={['admin']}><Navigate to="/employees?action=add" replace /></PrivateRoute>
      } />

      {/* Default redirect to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications - global */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
            }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
