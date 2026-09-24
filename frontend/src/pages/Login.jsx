// =============================================
// src/pages/Login.jsx
// Login Page - Universal authentication for all roles
// =============================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CalendarCheck2, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);

      // Navigate to dashboard upon successful login
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', justifyContent: 'center' }}>
          <CalendarCheck2 size={46} color="#2563EB" />
        </div>
        <h1 className="auth-title">Leave Management</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
            <LogIn size={16} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link text-muted" style={{ fontSize: '13px', color: '#64748B', marginTop: '16px' }}>
          🔒 New account access requires Admin creation.
        </p>
      </div>
    </div>
  );
};

export default Login;
