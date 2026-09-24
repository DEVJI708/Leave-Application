// =============================================
// src/pages/TeamMembers.jsx
// Manager: Team Members & Leave History (English)
// =============================================

import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  UserCheck,
  History,
  X,
  Calendar,
  Search,
  Building,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

const TeamMembers = () => {
  const [members, setMembers] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, leavesRes] = await Promise.all([
        API.get('/users'),
        API.get('/leaves/team')
      ]);
      setMembers(usersRes.data);
      setTeamLeaves(leavesRes.data);
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const statusClass = {
    approved: 'badge-success',
    rejected: 'badge-danger',
    pending: 'badge-warning',
    cancelled: 'badge-grey'
  };

  // Filter leaves for selected member
  const memberLeaves = selectedMember
    ? teamLeaves.filter(l => (l.employee?._id === selectedMember._id || l.employee === selectedMember._id))
    : [];

  // Summary counts
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.isActive).length;
  const teamApplications = teamLeaves.length;

  // Search filter
  const filteredMembers = members.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.department?.toLowerCase().includes(term)
    );
  });

  if (loading) return <Layout><div className="loading">Loading team members...</div></Layout>;

  return (
    <Layout>
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">
            <UserCheck size={24} color="#2563EB" /> My Team Members Directory
          </h2>
        </div>

        {/* KPI Stats Cards */}
        <div className="stats-grid" style={{ marginBottom: '22px' }}>
          <div className="stat-card blue">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Assigned Members</div>
                <div className="stat-num">{totalMembers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Users size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Active Members</div>
                <div className="stat-num">{activeMembers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Total Leave Applications</div>
                <div className="stat-num">{teamApplications}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#FAF5FF', color: '#7C3AED' }}>
                <Calendar size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="filter-bar-card">
          <div className="filter-bar-controls">
            <div className="search-box-wrapper" style={{ maxWidth: '400px' }}>
              <div className="search-box-icon">
                <Search size={15} />
              </div>
              <input
                type="text"
                className="search-box-input"
                placeholder="Search team member by name, email, or dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredMembers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={28} />
              </div>
              <div className="empty-state-title">No Team Members Found</div>
              <div className="empty-state-desc">
                {searchTerm
                  ? 'No team members match your current search query.'
                  : 'No employees are assigned to your team yet.'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Department</th>
                    <th>Remaining Balances (C / S / E)</th>
                    <th>Status</th>
                    <th>Leave History</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m._id}>
                      {/* User Cell */}
                      <td>
                        <div className="user-cell">
                          <div
                            className="user-avatar-sm"
                            style={{ background: '#2563EB' }}
                          >
                            {m.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="user-cell-meta">
                            <span className="user-cell-name">{m.name}</span>
                            <span className="user-cell-sub">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: '#334155' }}>
                          <Building size={14} style={{ color: '#64748B' }} />
                          {m.department || 'General'}
                        </span>
                      </td>

                      {/* Leave Balance */}
                      <td>
                        <div className="leave-chips-group">
                          <span className="chip chip-casual" title="Casual Leave">
                            C: {m.leaveBalance?.casual ?? 0}
                          </span>
                          <span className="chip chip-sick" title="Sick Leave">
                            S: {m.leaveBalance?.sick ?? 0}
                          </span>
                          <span className="chip chip-earned" title="Earned Leave">
                            E: {m.leaveBalance?.earned ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${m.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {m.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Leave History */}
                      <td>
                        <button
                          className="btn-secondary-sm"
                          onClick={() => setSelectedMember(m)}
                        >
                          <History size={13} /> View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ---- Employee Leave History Modal ---- */}
        {selectedMember && (
          <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
            <div
              className="modal"
              style={{ maxWidth: '750px', width: '92%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  <Calendar size={18} color="#2563EB" /> {selectedMember.name}'s Leave History
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedMember(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Leave Balance Header Card */}
              <div style={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={16} color="#2563EB" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E40AF' }}>Available Leave Balance:</span>
                </div>
                <div className="leave-chips-group">
                  <span className="chip chip-casual" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    Casual: <strong>{selectedMember.leaveBalance?.casual ?? 0} days</strong>
                  </span>
                  <span className="chip chip-sick" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    Sick: <strong>{selectedMember.leaveBalance?.sick ?? 0} days</strong>
                  </span>
                  <span className="chip chip-earned" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    Earned: <strong>{selectedMember.leaveBalance?.earned ?? 0} days</strong>
                  </span>
                </div>
              </div>

              {/* Leaves Table */}
              {memberLeaves.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 10px' }}>
                  <div className="empty-state-icon">
                    <Layers size={24} />
                  </div>
                  <div className="empty-state-title">No History Available</div>
                  <div className="empty-state-desc">This employee has not submitted any leave applications yet.</div>
                </div>
              ) : (
                <div className="table-wrapper" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberLeaves.map(l => (
                        <tr key={l._id}>
                          <td>
                            <span className={`chip chip-${l.leaveType || 'casual'}`}>
                              {l.leaveType?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className="date-range-badge">
                              {new Date(l.startDate).toLocaleDateString('en-US')} — {new Date(l.endDate).toLocaleDateString('en-US')}
                            </span>
                          </td>
                          <td>
                            <span className="days-count-pill">{l.totalDays}d</span>
                          </td>
                          <td className="reason-cell" title={l.reason}>{l.reason}</td>
                          <td>
                            <span className={`badge ${statusClass[l.status] || 'badge-grey'}`}>
                              {l.status?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedMember(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default TeamMembers;
