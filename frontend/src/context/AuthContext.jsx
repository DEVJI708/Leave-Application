// =============================================
// src/context/AuthContext.jsx
// Global Auth State - Provides authentication context across the application
// =============================================

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

// Create Auth context
const AuthContext = createContext();

// Provider Component - Wraps application in App.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Current logged in user
  const [loading, setLoading] = useState(true); // Loading state

  // Check for existing session and synchronize latest user profile on app start
  useEffect(() => {
    // Clear any legacy localStorage items so tabs remain completely independent
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch {}

    const savedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Sync fresh profile data from backend
      refreshProfile();
    }
    setLoading(false);
  }, []);

  // ---- Refresh Profile Function ----
  const refreshProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      if (res.data) {
        const updated = {
          id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          department: res.data.department,
          leaveBalance: res.data.leaveBalance,
          manager: res.data.manager
        };
        sessionStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        return updated;
      }
    } catch {}
  };

  // ---- Login Function ----
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user } = res.data;

    // Save credentials to sessionStorage (isolated per tab)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user; // Caller redirects based on user role
  };

  // ---- Register Function ----
  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    const { token, user } = res.data;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  // ---- Logout Function ----
  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume authentication context
export const useAuth = () => useContext(AuthContext);
