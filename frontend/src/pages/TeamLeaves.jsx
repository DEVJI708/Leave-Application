// =============================================
// src/pages/TeamLeaves.jsx
// Manager: Team Leaves Review & Summary (English)
// =============================================

import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  Users,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Search,
  Trash2,
  Calendar,
  RotateCcw,
  Layers
} from 'lucide-react';

const TeamLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeamLeaves();
  }, []);

  const fetchTeamLeaves = async () => {
    try {
      const res = await API.get('/leaves/team');
      setLeaves(res.data);
    } catch (error) {
      toast.error('Failed to load team leave requests');
    } finally {
      setLoading(false);
    }
  };

  // Permanently delete employee leave record from database
  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this leave record from the database?')) {
      return;
    }
    try {
      const res = await API.delete(`/leaves/${id}`);
      toast.success(res.data.message || 'Leave record deleted permanently!');
      fetchTeamLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete leave record');
    }
  };

  // Manager action (approve/reject employee leave)
  const handleAction = async (id, action) => {
    const remarkText = window.prompt(`Enter remark for ${action} (optional):`, '');
    try {
      const res = await API.put(`/leaves/${id}/manager-action`, {
        action,
        remark: remarkText || ''
      });
      toast.success(res.data.message || `Leave request ${action} successfully!`);
      fetchTeamLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const statusClass = {
    approved: 'badge-success',
    rejected: 'badge-danger',
    pending: 'badge-warning',
    cancelled: 'badge-grey'
  };

  // Summary counts
  const totalCount = leaves.length;
  const pendingCount = leaves.filter(l => l.managerStatus === 'pending' && l.status !== 'cancelled').length;
  const approvedCount = leaves.filter(l => l.managerStatus === 'approved').length;
  const rejectedCount = leaves.filter(l => l.managerStatus === 'rejected').length;

  // Unique team members for filter dropdown
  const memberMap = new Map();
  leaves.forEach(l => {
    if (l.employee?._id) {
      memberMap.set(l.employee._id, l.employee.name);
    }
  });
  const teamMembers = Array.from(memberMap.entries()).map(([id, name]) => ({ id, name }));

  // Filtered leaves
  const filteredLeaves = leaves.filter(l => {
    if (statusFilter !== 'all' && l.managerStatus !== statusFilter) return false;
    if (memberFilter !== 'all' && l.employee?._id !== memberFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = l.employee?.name?.toLowerCase().includes(term);
      const matchEmail = l.employee?.email?.toLowerCase().includes(term);
      const matchReason = l.reason?.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchReason) return false;
    }
    return true;
  });

  const hasActiveFilters = statusFilter !== 'all' || memberFilter !== 'all' || searchTerm !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setMemberFilter('all');
    setSearchTerm('');
  };

  if (loading) return <Layout><div className="loading">Loading team leaves...</div></Layout>;

  return (
    <Layout>
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">
            <Users size={24} color="#2563EB" /> Team Leaves Review & Approval
          </h2>
        </div>

        {/* ---- Team Leave Summary Cards ---- */}
        <div className="stats-grid" style={{ marginBottom: '22px' }}>
          <div
            className={`stat-card blue ${statusFilter === 'all' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Total Requests</div>
                <div className="stat-num">{totalCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <ClipboardList size={22} />
              </div>
            </div>
          </div>

          <div
            className={`stat-card orange ${statusFilter === 'pending' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setStatusFilter(prev => prev === 'pending' ? 'all' : 'pending')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Action Required</div>
                <div className="stat-num">{pendingCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div
            className={`stat-card green ${statusFilter === 'approved' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setStatusFilter(prev => prev === 'approved' ? 'all' : 'approved')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Approved by You</div>
                <div className="stat-num">{approvedCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div
            className={`stat-card red ${statusFilter === 'rejected' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setStatusFilter(prev => prev === 'rejected' ? 'all' : 'rejected')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Rejected</div>
                <div className="stat-num">{rejectedCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* ---- Filter Bar Card ---- */}
        <div className="filter-bar-card">
          <div className="filter-bar-controls">
            {/* Search Box */}
            <div className="search-box-wrapper">
              <div className="search-box-icon">
                <Search size={15} />
              </div>
              <input
                type="text"
                className="search-box-input"
                placeholder="Search employee or reason..."
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

            {/* Member Filter Dropdown */}
            <div className="filter-dropdown-group">
              <span className="filter-dropdown-label">Member:</span>
              <select
                className="filter-select"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                <option value="all">All Team Members</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn-secondary-sm"
                onClick={resetFilters}
                title="Reset all filters"
                style={{ marginLeft: 'auto' }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}

          </div>
        </div>

        {/* ---- Team Leaves Table ---- */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredLeaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Layers size={28} />
              </div>
              <div className="empty-state-title">No Team Leaves Found</div>
              <div className="empty-state-desc">
                {hasActiveFilters
                  ? 'No team leave applications match your selected filter criteria.'
                  : 'Your team members currently have not submitted any leave requests.'}
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={resetFilters}
                  style={{ marginTop: '14px' }}
                >
                  <RotateCcw size={13} /> Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Manager Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id}>
                      {/* Employee Cell */}
                      <td>
                        <div className="user-cell">
                          <div
                            className="user-avatar-sm"
                            style={{ background: '#2563EB' }}
                          >
                            {leave.employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="user-cell-meta">
                            <span className="user-cell-name">{leave.employee?.name}</span>
                            <span className="user-cell-sub">{leave.employee?.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td>
                        <span className={`chip chip-${leave.leaveType || 'casual'}`}>
                          {leave.leaveType?.toUpperCase()}
                        </span>
                      </td>

                      {/* Dates */}
                      <td>
                        <span className="date-range-badge">
                          <Calendar size={13} style={{ color: '#64748B' }} />
                          {new Date(leave.startDate).toLocaleDateString('en-US')} — {new Date(leave.endDate).toLocaleDateString('en-US')}
                        </span>
                      </td>

                      {/* Days */}
                      <td>
                        <span className="days-count-pill">
                          {leave.totalDays}d
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="reason-cell" title={leave.reason}>{leave.reason}</td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${statusClass[leave.managerStatus] || 'badge-grey'}`}>
                          {leave.managerStatus ? leave.managerStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-btns" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {leave.managerStatus === 'pending' && leave.status !== 'cancelled' && (
                            <>
                              <button
                                className="btn-success-sm"
                                onClick={() => handleAction(leave._id, 'approved')}
                                title="Approve employee leave"
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                className="btn-danger-sm"
                                onClick={() => handleAction(leave._id, 'rejected')}
                                title="Reject employee leave"
                              >
                                <X size={13} /> Reject
                              </button>
                            </>
                          )}
                          <button
                            className="btn-danger-sm"
                            onClick={() => handleDeleteLeave(leave._id)}
                            title="Permanently delete this leave from database"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamLeaves;
