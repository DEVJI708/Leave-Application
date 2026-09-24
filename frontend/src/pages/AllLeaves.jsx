// =============================================
// src/pages/AllLeaves.jsx
// Admin: All Leaves View & Manager Leave Management (English)
// =============================================

import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  ClipboardList,
  Check,
  X,
  Filter,
  Search,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  Layers
} from 'lucide-react';

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const fetchAllLeaves = async () => {
    try {
      const res = await API.get('/leaves/all');
      setLeaves(res.data);
    } catch (error) {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  // Permanently delete leave record
  /*const handleDeleteLeave = async (id) => {
    if (!window.confirm(' Permanently delete this leave record from the database?')) {
      return;
    }
    try {
      const res = await API.delete(`/leaves/${id}`);
      toast.success(res.data.message || 'Leave record deleted permanently!');
      fetchAllLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete leave record');
    }
  };
*/
const handleDeleteLeave = async (id) => {
  const confirmation = window.prompt(
    'Permanently delete this leave record?\nType "yes" to confirm:'
  );

  if (confirmation?.trim().toLowerCase() !== 'yes') {
    return;
  }

  try {
    const res = await API.delete(`/leaves/${id}`);
    toast.success(res.data.message || 'Leave record deleted permanently!');
    fetchAllLeaves();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete leave record');
  }
};  

// Admin action for Manager leaves
  const handleAction = async (id, action) => {
    const remarkText = window.prompt(`Enter remark for ${action} (optional):`, '');
    try {
      const res = await API.put(`/leaves/${id}/admin-action`, {
        action,
        remark: remarkText || ''
      });
      toast.success(res.data.message || `Leave request ${action} by Admin!`);
      fetchAllLeaves();
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

  // Stats calculation
  const totalCount = leaves.length;
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

  // Unique departments for filter
  const departments = Array.from(new Set(leaves.map(l => l.employee?.department).filter(Boolean)));

  // Filter logic
  const filteredLeaves = leaves.filter(leave => {
    if (statusFilter !== 'all' && leave.status !== statusFilter) return false;
    if (roleFilter !== 'all' && leave.employee?.role !== roleFilter) return false;
    if (deptFilter !== 'all' && leave.employee?.department !== deptFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = leave.employee?.name?.toLowerCase().includes(term);
      const matchEmail = leave.employee?.email?.toLowerCase().includes(term);
      const matchReason = leave.reason?.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchReason) return false;
    }
    return true;
  });

  const hasActiveFilters = statusFilter !== 'all' || roleFilter !== 'all' || deptFilter !== 'all' || searchTerm !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setRoleFilter('all');
    setDeptFilter('all');
    setSearchTerm('');
  };

  if (loading) return <Layout><div className="loading">Loading organization leaves...</div></Layout>;

  return (
    <Layout>
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">
            <ClipboardList size={24} color="#2563EB" /> All Organization Leaves & Reports
          </h2>
        </div>

        {/* KPI / Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '22px' }}>
          <div
            className={`stat-card blue ${statusFilter === 'all' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Total Applications</div>
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
                <div className="stat-label">Pending Review</div>
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
                <div className="stat-label">Approved Leaves</div>
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
                <div className="stat-label">Rejected Requests</div>
                <div className="stat-num">{rejectedCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar Card */}
        <div className="filter-bar-card">
          <div className="filter-bar-controls">
            
            {/* Search Input */}
            <div className="search-box-wrapper">
              <div className="search-box-icon">
                <Search size={15} />
              </div>
              <input
                type="text"
                className="search-box-input"
                placeholder="Search employee, email, or reason..."
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

            {/* Role Filter */}
            <div className="filter-dropdown-group">
              <span className="filter-dropdown-label">Role:</span>
              <select
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="employee">Employees Only</option>
                <option value="manager">Managers Only</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="filter-dropdown-group">
              <span className="filter-dropdown-label">Department:</span>
              <select
                className="filter-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
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

        {/* Organization Leaves Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredLeaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Layers size={28} />
              </div>
              <div className="empty-state-title">No Leave Applications Found</div>
              <div className="empty-state-desc">
                {hasActiveFilters
                  ? 'No applications match your selected filters. Try clearing or changing your filters.'
                  : 'There are currently no leave records recorded in the organization.'}
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
                    <th>Applicant</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Manager Review</th>
                    <th>Final Status</th>
                    <th>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => {
                    const role = leave.employee?.role || 'employee';
                    const isManagerLeave = role === 'manager';
                    const isEmployeeLeave = role === 'employee';

                    return (
                      <tr key={leave._id}>
                        {/* Applicant */}
                        <td>
                          <div className="user-cell">
                            <div
                              className="user-avatar-sm"
                              style={{ background: roleAvatarBg[role] || '#2563EB' }}
                            >
                              {leave.employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="user-cell-meta">
                              <span className="user-cell-name">{leave.employee?.name}</span>
                              <span className="user-cell-sub">{leave.employee?.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td>
                          <span className={`badge ${roleBadgeClass[role] || 'badge-grey'}`} style={{ border: 'none' }}>
                            {role.toUpperCase()}
                          </span>
                        </td>

                        {/* Department */}
                        <td>
                          <span style={{ fontWeight: 500, color: '#334155' }}>
                            {leave.employee?.department || 'General'}
                          </span>
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

                        {/* Manager Review */}
                        <td>
                          {isManagerLeave ? (
                            <span className="badge badge-purple" style={{ border: 'none' }}>Self (Manager)</span>
                          ) : (
                            <span className={`badge ${statusClass[leave.managerStatus] || 'badge-grey'}`} style={{ border: 'none' }}>
                              {leave.managerStatus ? leave.managerStatus.toUpperCase() : 'PENDING'}
                            </span>
                          )}
                        </td>

                        {/* Final Status */}
                        <td>
                          <span className={`badge ${statusClass[leave.status] || 'badge-grey'}`} style={{ border: 'none' }}>
                            {leave.status?.toUpperCase()}
                          </span>
                        </td>

                        {/* Admin Action */}
                        <td>
                          <div className="action-btns" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {/* Manager leaves: Admin manages and takes action */}
                            {isManagerLeave && leave.status === 'pending' ? (
                              <>
                                <button
                                  className="btn-success-sm"
                                  onClick={() => handleAction(leave._id, 'approved')}
                                  title="Approve Manager Leave"
                                >
                                  <Check size={13} /> Approve
                                </button>
                                <button
                                  className="btn-danger-sm"
                                  onClick={() => handleAction(leave._id, 'rejected')}
                                  title="Reject Manager Leave"
                                >
                                  <X size={13} /> Reject
                                </button>
                              </>
                            ) : isEmployeeLeave ? (
                              <span className="badge badge-grey" style={{ fontSize: '11px', border: 'none' }} title="Employee leave is managed by their Manager">
                                Manager Managed
                              </span>
                            ) : null}

                            <button
                              className="btn-danger-sm"
                              onClick={() => handleDeleteLeave(leave._id)}
                              title="Permanently delete leave record from database"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllLeaves;
