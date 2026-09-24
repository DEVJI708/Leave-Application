// =============================================
// src/pages/ApplyLeave.jsx
// Leave Application Form (English)
// =============================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  FilePlus2,
  Calendar,
  Send,
  User,
  Building,
  Wallet,
  Pencil,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const ApplyLeave = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calcDays() <= 0) {
      toast.error('End Date must be greater than or equal to Start Date');
      return;
    }

    setLoading(true);
    try {
      await API.post('/leaves/apply', form);
      const managerMsg = user?.role === 'manager'
        ? 'Leave request submitted successfully! Admin will review it.'
        : 'Leave request submitted successfully! Your Manager will review it.';
      toast.success(managerMsg);
      navigate('/my-leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total days for preview
  const calcDays = () => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const daysApplied = calcDays();
  const selectedBalance = user?.leaveBalance ? user.leaveBalance[form.leaveType] : undefined;
  const isBalanceSufficient = selectedBalance !== undefined ? selectedBalance >= daysApplied : true;

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h2 className="page-title">
            <FilePlus2 size={24} color="#2563EB" /> Submit Leave Application
          </h2>
        </div>

        <div className="card" style={{ maxWidth: '680px' }}>

          {/* ---- Applicant Information Box ---- */}
          <div className="applicant-card-banner">
            <div className="applicant-card-header">
              <div className="applicant-card-user">
                <div className="applicant-card-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', fontWeight: '700' }}>
                    Applicant
                  </div>
                  <div style={{ fontSize: '17px', color: '#0F172A', fontWeight: '700' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{user?.email}</div>
                </div>
              </div>

              <Link
                to="/profile"
                className="btn-secondary-sm"
                title="Edit your profile"
              >
                <Pencil size={12} /> Edit Profile
              </Link>
            </div>

            <div className="applicant-card-details">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                <Building size={14} style={{ color: '#64748B' }} /> Dept: <strong>{user?.department || 'General'}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                <User size={14} style={{ color: '#64748B' }} /> Role: <strong className="capitalize">{user?.role}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0891B2', fontWeight: 600 }}>
                <Wallet size={14} /> Total Quota: {(user?.leaveBalance?.casual ?? 0) + (user?.leaveBalance?.sick ?? 0) + (user?.leaveBalance?.earned ?? 0)} days
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Leave Type Selector with Live Quota Badges */}
            <div className="form-group">
              <label>Leave Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '4px' }}>
                <div
                  onClick={() => setForm({ ...form, leaveType: 'casual' })}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: form.leaveType === 'casual' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    background: form.leaveType === 'casual' ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: form.leaveType === 'casual' ? '#1E40AF' : '#1E293B' }}>
                    Casual Leave
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    <strong>{user?.leaveBalance?.casual ?? 0}</strong> days left
                  </div>
                </div>

                <div
                  onClick={() => setForm({ ...form, leaveType: 'sick' })}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: form.leaveType === 'sick' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                    background: form.leaveType === 'sick' ? '#FAF5FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: form.leaveType === 'sick' ? '#6B21A8' : '#1E293B' }}>
                    Sick Leave
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    <strong>{user?.leaveBalance?.sick ?? 0}</strong> days left
                  </div>
                </div>

                <div
                  onClick={() => setForm({ ...form, leaveType: 'earned' })}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: form.leaveType === 'earned' ? '2px solid #16A34A' : '1px solid #E2E8F0',
                    background: form.leaveType === 'earned' ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: form.leaveType === 'earned' ? '#166534' : '#1E293B' }}>
                    Earned Leave
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    <strong>{user?.leaveBalance?.earned ?? 0}</strong> days left
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Days Preview Badge */}
            {daysApplied > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                background: isBalanceSufficient ? '#F0FDF4' : '#FEF2F2',
                border: isBalanceSufficient ? '1px solid #BBF7D0' : '1px solid #FECACA'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isBalanceSufficient ? '#166534' : '#991B1B' }}>
                  <Clock size={16} />
                  <span>Calculated Duration: <strong>{daysApplied} day(s)</strong></span>
                </div>
                {!isBalanceSufficient && (
                  <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} /> Exceeds current {form.leaveType} balance ({selectedBalance}d)
                  </span>
                )}
              </div>
            )}

            {/* Reason Textarea */}
            <div className="form-group">
              <label>Reason for Leave</label>
              <textarea
                name="reason"
                className="form-control"
                placeholder="Briefly describe the reason for taking leave (e.g. personal appointment, family function, health recovery)..."
                value={form.reason}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-row" style={{ marginTop: '6px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <Send size={15} />
                {loading ? 'Submitting Application...' : `Submit Application`}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/my-leaves')}
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

export default ApplyLeave;
