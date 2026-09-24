// =============================================
// src/pages/AddEmployee.jsx
// Admin: Add New Employee / Manager (English)
// =============================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  UserPlus,
  Wallet,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Building,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const AddEmployee = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    managerId: '',
    casualLeave: 12,
    sickLeave: 10,
    earnedLeave: 15
  });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await API.get('/users/managers');
        setManagers(res.data);
      } catch {}
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
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        department: form.department.trim() || 'General',
        managerId: form.role === 'employee' ? (form.managerId || null) : null,
        leaveBalance: {
          casual: Number(form.casualLeave) || 0,
          sick: Number(form.sickLeave) || 0,
          earned: Number(form.earnedLeave) || 0
        }
      };

      await API.post('/auth/register', payload);
      toast.success(`${form.role === 'manager' ? 'Manager' : 'Employee'} account created successfully!`);
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/employees" className="btn-secondary-sm" title="Back to Employees">
              <ArrowLeft size={14} /> Back
            </Link>
            <h2 className="page-title" style={{ margin: 0 }}>
              <UserPlus size={24} color="#2563EB" /> Add New Staff Member
            </h2>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '680px' }}>
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Section 1: Account Credentials */}
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} color="#2563EB" /> 1. Personal & Login Details
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="user@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Initial Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Set temporary password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Role & Department */}
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#7C3AED" /> 2. Role & Organizational Placement
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" className="filter-select" value={form.role} onChange={handleChange}>
                    <option value="employee">Employee (Submits leaves to Manager)</option>
                    <option value="manager">Manager (Reviews Team & submits to Admin)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    placeholder="e.g. Engineering, Sales, HR"
                    value={form.department}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {form.role === 'employee' && (
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Assign Reporting Manager</label>
                  <select name="managerId" className="filter-select" value={form.managerId} onChange={handleChange}>
                    <option value="">-- Select Reporting Manager --</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>{m.name} ({m.department})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Section 3: Leave Balance Quota Allocation */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wallet size={16} color="#0891B2" /> 3. Annual Leave Quota Allocation (Days)
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF', display: 'block', marginBottom: '6px' }}>Casual Leave</label>
                    <input
                      type="number"
                      name="casualLeave"
                      min="0"
                      className="form-control"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.casualLeave}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B21A8', display: 'block', marginBottom: '6px' }}>Sick Leave</label>
                    <input
                      type="number"
                      name="sickLeave"
                      min="0"
                      className="form-control"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.sickLeave}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#166534', display: 'block', marginBottom: '6px' }}>Earned Leave</label>
                    <input
                      type="number"
                      name="earnedLeave"
                      min="0"
                      className="form-control"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.earnedLeave}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '16px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <UserPlus size={16} />
                {loading ? 'Creating Account...' : `Create Staff Account`}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/employees')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddEmployee;
