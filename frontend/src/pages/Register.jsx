// =============================================
// src/pages/Register.jsx
// Registration Page
// =============================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { CalendarCheck2, UserPlus } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    managerId: ''
  });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch managers list for manager selection dropdown
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await API.get('/users/managers');
        setManagers(res.data);
      } catch {
        // Ignore if unauthenticated or request fails
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed!');
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Leave Management System</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Apna naam daalo"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Agar employee hai to manager select karo */}
          {form.role === 'employee' && managers.length > 0 && (
            <div className="form-group">
              <label>Apna Manager Select Karo</label>
              <select name="managerId" value={form.managerId} onChange={handleChange}>
                <option value="">-- Select Manager --</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
            <UserPlus size={16} />
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already account hai? <Link to="/login">Login karo</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
