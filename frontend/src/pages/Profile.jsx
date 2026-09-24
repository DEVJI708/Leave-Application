// =============================================
// src/pages/Profile.jsx
// User Profile View & Update (English)
// =============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { User, KeyRound, Shield, Building, UserCheck, Wallet, Save, Mail, CheckCircle2, Pencil, X, Lock } from 'lucide-react';

const Profile = () => {
  const { user: authUser, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      setProfile(res.data);
      setName(res.data.name || '');
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(profile?.name || '');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password && password.length < 4) {
      toast.error('Password must be at least 4 characters long');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim() };
      if (password) payload.password = password;

      const res = await API.put('/auth/profile', payload);
      toast.success(res.data.message || 'Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setIsEditing(false);

      if (refreshProfile) {
        await refreshProfile();
      }

      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const roleBadgeClass = {
    admin: 'badge-danger',
    manager: 'badge-purple',
    employee: 'badge-blue'
  };

  const roleAvatarBg = {
    admin: '#DC2626',
    manager: '#7C3AED',
    employee: '#2563EB'
  };

  if (loading) return <Layout><div className="loading">Loading profile...</div></Layout>;

  return (
    <Layout>
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">
            <User size={24} color="#2563EB" /> Account Profile Settings
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>

          {/* ---- Profile Details Card ---- */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: roleAvatarBg[profile?.role] || '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '700',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
                }}
              >
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{profile?.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span className={`badge ${roleBadgeClass[profile?.role] || 'badge-grey'}`}>
                    {profile?.role?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{profile?.email}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span className="text-muted" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Email Address
                </span>
                <strong style={{ fontSize: '13px' }}>{profile?.email}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span className="text-muted" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={14} /> Department
                </span>
                <strong style={{ fontSize: '13px' }}>{profile?.department || 'General'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span className="text-muted" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} /> Account Privilege
                </span>
                <span className={`badge ${roleBadgeClass[profile?.role] || 'badge-grey'}`}>
                  {profile?.role?.toUpperCase()}
                </span>
              </div>

              {profile?.manager && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span className="text-muted" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} /> Reporting Manager
                  </span>
                  <strong style={{ fontSize: '13px' }}>{profile.manager.name} ({profile.manager.email})</strong>
                </div>
              )}
            </div>

            {/* Leave Balance Section */}
            {profile?.leaveBalance && (
              <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A' }}>
                  <Wallet size={16} color="#0891B2" /> Available Leave Quota
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Casual</div>
                    <strong style={{ fontSize: '20px', color: '#1E3A8A' }}>{profile.leaveBalance.casual ?? 0}</strong>
                  </div>
                  <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#6B21A8', fontWeight: 600 }}>Sick</div>
                    <strong style={{ fontSize: '20px', color: '#581C87' }}>{profile.leaveBalance.sick ?? 0}</strong>
                  </div>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Earned</div>
                    <strong style={{ fontSize: '20px', color: '#14532D' }}>{profile.leaveBalance.earned ?? 0}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---- Edit Profile Form ---- */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} color="#2563EB" /> Profile & Security Settings
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '13px' }}
                  id="btn-edit-profile"
                >
                  <Pencil size={14} /> Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '14px 16px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Display Name
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                    {profile?.name}
                  </div>
                </div>

                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '14px 16px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={13} /> Account Password
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', letterSpacing: '2px' }}>
                    ••••••••••••
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label>Display Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    autoFocus
                  />
                </div>

                <div style={{ margin: '14px 0 6px 0', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  <KeyRound size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
                  Update Password (leave blank to keep unchanged)
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min. 4 characters)"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <X size={15} /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    <Save size={15} />
                    {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Profile;
