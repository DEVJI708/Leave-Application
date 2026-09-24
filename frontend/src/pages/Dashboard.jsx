// =============================================
// src/pages/Dashboard.jsx
// Dashboard with Clickable Stat Cards & Profile Banner (English)
// =============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Check,
  Ban,
  Wallet,
  Zap,
  FilePlus2,
  UserPlus,
  Pencil,
  Building,
  UserCheck,
  User,
  ShieldCheck,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';

const Dashboard = () => {
  const { user, refreshProfile } = useAuth();
  const [allLeaves, setAllLeaves]             = useState([]);
  const [allUsers, setAllUsers]               = useState([]);
  const [myLeaves, setMyLeaves]               = useState([]);
  const [adminRoleFilter, setAdminRoleFilter] = useState('all'); // 'all' | 'employee' | 'manager'
  const [activeFilter, setActiveFilter]       = useState(null);
  const [loading, setLoading]                 = useState(true);

  // Profile Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName]           = useState('');
  const [editPassword, setEditPassword]   = useState('');
  const [editSaving, setEditSaving]       = useState(false);

  useEffect(() => { loadDashboard(); }, [user]);

  // ---- Data Load ----
  const loadDashboard = async () => {
    setLoading(true);
    try {
      if (user?.role === 'employee') {
        const res = await API.get('/leaves/my');
        setMyLeaves(res.data);
      }

      if (user?.role === 'manager') {
        const [myRes, teamRes, teamUsersRes] = await Promise.all([
          API.get('/leaves/my'),
          API.get('/leaves/team'),
          API.get('/users'),
        ]);
        setMyLeaves(myRes.data);
        setAllLeaves(teamRes.data);
        setAllUsers(teamUsersRes.data);
      }

      if (user?.role === 'admin') {
        const [allRes, usersRes] = await Promise.all([
          API.get('/leaves/all'),
          API.get('/users'),
        ]);
        setAllLeaves(allRes.data);
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Actions ----
  const managerAction = async (id, action) => {
    const remark = window.prompt('Enter remark (optional):') ?? '';
    try {
      await API.put(`/leaves/${id}/manager-action`, { action, remark });
      toast.success(`Leave request ${action === 'approved' ? 'Approved' : 'Rejected'}!`);
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave');
    }
  };

  const adminAction = async (id, action) => {
    const remark = window.prompt('Enter remark (optional):') ?? '';
    try {
      await API.put(`/leaves/${id}/admin-action`, { action, remark });
      toast.success(`Leave request ${action === 'approved' ? 'Approved' : 'Rejected'} by Admin!`);
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave');
    }
  };

  const cancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await API.put(`/leaves/${id}/cancel`);
      toast.success('Leave application cancelled successfully!');
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this leave record from the database?')) {
      return;
    }
    try {
      const res = await API.delete(`/leaves/${id}`);
      toast.success(res.data.message || 'Leave record deleted permanently from database!');
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete leave record');
    }
  };

  // ---- Handle Profile Update directly from Dashboard ----
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setEditSaving(true);
    try {
      const payload = { name: editName.trim() };
      if (editPassword && editPassword.trim().length > 0) {
        payload.password = editPassword.trim();
      }
      const res = await API.put('/auth/profile', payload);
      toast.success(res.data.message || 'Profile updated successfully!');
      if (refreshProfile) {
        await refreshProfile();
      }
      setEditModalOpen(false);
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed');
    } finally {
      setEditSaving(false);
    }
  };

  // ---- Dynamic Stats Computation ----
  const getStats = () => {
    if (user?.role === 'employee') {
      return {
        total:    myLeaves.length,
        approved: myLeaves.filter(l => l.status === 'approved').length,
        pending:  myLeaves.filter(l => l.status === 'pending').length,
        rejected: myLeaves.filter(l => l.status === 'rejected').length,
      };
    }

    if (user?.role === 'manager') {
      const teamPendingCount = allLeaves.filter(
        l => l.managerStatus === 'pending' && l.status !== 'cancelled'
      ).length;
      return {
        totalEmployees: allUsers.length,
        total:          allLeaves.length,
        approved:       allLeaves.filter(l => l.managerStatus === 'approved').length,
        pending:        teamPendingCount,
        rejected:       allLeaves.filter(l => l.managerStatus === 'rejected').length,
      };
    }

    if (user?.role === 'admin') {
      const roleLeaves = adminRoleFilter === 'all'
        ? allLeaves
        : allLeaves.filter(l => l.employee?.role === adminRoleFilter);

      const roleUsers = adminRoleFilter === 'all'
        ? allUsers.filter(u => u.role !== 'admin')
        : allUsers.filter(u => u.role === adminRoleFilter);

      return {
        totalEmployees: roleUsers.length,
        total:          roleLeaves.length,
        approved:       roleLeaves.filter(l => l.status === 'approved').length,
        pending:        roleLeaves.filter(l => l.status === 'pending').length,
        rejected:       roleLeaves.filter(l => l.status === 'rejected').length,
      };
    }

    return {};
  };

  const currentStats = getStats();

  // Counts for Admin Role Filter pills
  const allLeavesCount      = allLeaves.length;
  const employeeLeavesCount = allLeaves.filter(l => l.employee?.role === 'employee').length;
  const managerLeavesCount  = allLeaves.filter(l => l.employee?.role === 'manager').length;

  // ---- Filter Logic ----
  const getFilteredLeaves = () => {
    if (!activeFilter) return [];

    // Employee own leaves
    if (user?.role === 'employee') {
      if (activeFilter === 'total') return myLeaves;
      return myLeaves.filter(l => l.status === activeFilter);
    }

    // Manager: team leaves
    if (user?.role === 'manager') {
      if (activeFilter === 'total') return allLeaves;
      return allLeaves.filter(
        l => l.managerStatus === activeFilter && l.status !== 'cancelled'
      );
    }

    // Admin: filtered by adminRoleFilter first
    let pool = allLeaves;
    if (adminRoleFilter !== 'all') {
      pool = allLeaves.filter(l => l.employee?.role === adminRoleFilter);
    }

    if (activeFilter === 'total') return pool;
    return pool.filter(l => l.status === activeFilter);
  };

  // ---- Status Badge ----
  const badge = (status) => {
    const cls = {
      approved: 'badge-success',
      rejected: 'badge-danger',
      pending:  'badge-warning',
      cancelled:'badge-grey',
    };
    return <span className={`badge ${cls[status] || 'badge-grey'}`}>{status?.toUpperCase()}</span>;
  };

  // ---- Dynamic Stat cards config ----
  const getStatCards = () => {
    if (user?.role === 'employee') {
      return [
        { key: 'total',    label: 'Total Leaves', icon: ClipboardList, color: 'stat-purple', filterKey: 'total'    },
        { key: 'approved', label: 'Approved',     icon: CheckCircle2,  color: 'stat-green',  filterKey: 'approved' },
        { key: 'pending',  label: 'Pending',      icon: Clock,         color: 'stat-yellow', filterKey: 'pending'  },
        { key: 'rejected', label: 'Rejected',     icon: XCircle,       color: 'stat-red',    filterKey: 'rejected' },
      ];
    }

    if (user?.role === 'manager') {
      return [
        { key: 'totalEmployees', label: 'Team Members',   icon: Users, color: 'stat-blue', noFilter: true },
        { key: 'total',          label: 'Team Leaves',    icon: ClipboardList, color: 'stat-purple', filterKey: 'total'    },
        { key: 'approved',       label: 'Approved',       icon: CheckCircle2,  color: 'stat-green',  filterKey: 'approved' },
        { key: 'pending',        label: 'Pending Review', icon: Clock,         color: 'stat-yellow', filterKey: 'pending'  },
        { key: 'rejected',       label: 'Rejected',       icon: XCircle,       color: 'stat-red',    filterKey: 'rejected' },
      ];
    }

    // Admin
    const isManager = adminRoleFilter === 'manager';
    const isEmployee = adminRoleFilter === 'employee';

    const usersLabel    = isManager ? 'Total Managers' : isEmployee ? 'Total Employees' : 'Total Staff';
    const totalLabel    = isManager ? 'Manager Total Leaves' : isEmployee ? 'Employee Total Leaves' : 'Total Leaves';
    const approvedLabel = isManager ? 'Approved (Manager)' : isEmployee ? 'Approved (Employee)' : 'Approved';
    const pendingLabel  = isManager ? 'Pending (Manager)' : isEmployee ? 'Pending (Employee)' : 'Pending';
    const rejectedLabel = isManager ? 'Rejected (Manager)' : isEmployee ? 'Rejected (Employee)' : 'Rejected';

    return [
      { key: 'totalEmployees', label: usersLabel,     icon: isManager ? ShieldCheck : Users, color: 'stat-blue', noFilter: true },
      { key: 'total',          label: totalLabel,    icon: ClipboardList, color: 'stat-purple', filterKey: 'total'    },
      { key: 'approved',       label: approvedLabel, icon: CheckCircle2,  color: 'stat-green',  filterKey: 'approved' },
      { key: 'pending',        label: pendingLabel,  icon: Clock,         color: 'stat-yellow', filterKey: 'pending'  },
      { key: 'rejected',       label: rejectedLabel, icon: XCircle,       color: 'stat-red',    filterKey: 'rejected' },
    ];
  };

  const statCards = getStatCards();
  const filteredLeaves = getFilteredLeaves();

  if (loading) return <Layout><div className="loading">Loading dashboard...</div></Layout>;

  return (
    <Layout>
      <div className="page">

        {/* =============================================
            MY PROFILE DASHBOARD BANNER
            ============================================= */}
        <div className="card profile-dashboard-card" style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '18px 22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: user?.role === 'admin' ? '#DC2626' : user?.role === 'manager' ? '#D97706' : '#2563EB',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '700',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '19px', color: '#0F172A', fontWeight: '700' }}>
                  {user?.name}
                </h3>
                <span className={`badge ${user?.role === 'admin' ? 'badge-danger' : user?.role === 'manager' ? 'badge-warning' : 'badge-success'}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span>{user?.email}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building size={13} /> {user?.department || 'General'}
                </span>
                {user?.manager?.name && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={13} /> Manager: <strong>{user?.manager?.name}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            className="btn-secondary"
            onClick={() => {
              setEditName(user?.name || '');
              setEditPassword('');
              setEditModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
            title="Edit your name and password"
          >
            <Pencil size={14} /> Edit Profile
          </button>
        </div>

        {/* =============================================
            ADMIN ROLE FILTER BAR
            ============================================= */}
        {user?.role === 'admin' && (
          <div className="admin-role-filter-bar">
            <div className="filter-bar-title-group">
              <div className="filter-bar-icon-box">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <div className="filter-bar-title">
                  Filter Leave Dashboard by Role
                </div>
                <div className="filter-bar-subtitle">
                  {adminRoleFilter === 'all'
                    ? 'Showing all organizational leave statistics and requests'
                    : adminRoleFilter === 'manager'
                    ? 'Showing Manager leave statistics and requests only'
                    : 'Showing Employee leave statistics and requests only'}
                </div>
              </div>
            </div>

            <div className="filter-pills-group">
              <button
                type="button"
                className={`filter-pill-btn ${adminRoleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAdminRoleFilter('all')}
                id="filter-all-leaves"
              >
                <Users size={15} />
                <span>All Leaves</span>
                <span className="filter-pill-badge">{allLeavesCount}</span>
              </button>

              <button
                type="button"
                className={`filter-pill-btn ${adminRoleFilter === 'employee' ? 'active' : ''}`}
                onClick={() => setAdminRoleFilter('employee')}
                id="filter-employee-leaves"
              >
                <User size={15} />
                <span>Employee Leaves</span>
                <span className="filter-pill-badge">{employeeLeavesCount}</span>
              </button>

              <button
                type="button"
                className={`filter-pill-btn ${adminRoleFilter === 'manager' ? 'active' : ''}`}
                onClick={() => setAdminRoleFilter('manager')}
                id="filter-manager-leaves"
              >
                <ShieldCheck size={15} />
                <span>Manager Leaves</span>
                <span className="filter-pill-badge">{managerLeavesCount}</span>
              </button>
            </div>
          </div>
        )}

        {/* =============================================
            STAT CARDS
            ============================================= */}
        <div className="stats-grid">
          {statCards.map(card => {
            const CardIcon = card.icon;
            return (
              <div
                key={card.key}
                className={[
                  'stat-card',
                  card.color,
                  !card.noFilter ? 'stat-card-clickable' : '',
                  activeFilter === card.filterKey ? 'stat-card-active' : '',
                ].join(' ')}
                onClick={() => {
                  if (card.noFilter) return;
                  setActiveFilter(prev =>
                    prev === card.filterKey ? null : card.filterKey
                  );
                }}
              >
                <div className="stat-card-top">
                  <div className="stat-card-info">
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-num">{currentStats[card.key] ?? 0}</div>
                  </div>
                  <div className="stat-icon-wrapper">
                    <CardIcon size={22} />
                  </div>
                </div>
                {!card.noFilter && (
                  <div className="stat-hint">
                    {activeFilter === card.filterKey ? '▲ Close' : '▼ Click to View'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* =============================================
            FILTERED TABLE
            ============================================= */}
        {activeFilter && (
          <div className="card mt-20 filtered-table-card">

            {/* Header */}
            <div className="filtered-header">
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeFilter === 'total' && (
                  <>
                    <ClipboardList size={18} />
                    {user?.role === 'admin'
                      ? adminRoleFilter === 'manager'
                        ? 'All Manager Leaves'
                        : adminRoleFilter === 'employee'
                        ? 'All Employee Leaves'
                        : 'All Staff Leaves'
                      : 'All Leaves'}
                  </>
                )}
                {activeFilter === 'approved' && (
                  <>
                    <CheckCircle2 size={18} />
                    {user?.role === 'admin'
                      ? adminRoleFilter === 'manager'
                        ? 'Approved Manager Leaves'
                        : adminRoleFilter === 'employee'
                        ? 'Approved Employee Leaves'
                        : 'Approved Leaves'
                      : 'Approved Leaves'}
                  </>
                )}
                {activeFilter === 'pending' && (
                  <>
                    <Clock size={18} />
                    {user?.role === 'admin'
                      ? adminRoleFilter === 'manager'
                        ? 'Pending Manager Leaves'
                        : adminRoleFilter === 'employee'
                        ? 'Pending Employee Leaves'
                        : 'Pending Leaves'
                      : 'Pending Leaves'}
                  </>
                )}
                {activeFilter === 'rejected' && (
                  <>
                    <XCircle size={18} />
                    {user?.role === 'admin'
                      ? adminRoleFilter === 'manager'
                        ? 'Rejected Manager Leaves'
                        : adminRoleFilter === 'employee'
                        ? 'Rejected Employee Leaves'
                        : 'Rejected Leaves'
                      : 'Rejected Leaves'}
                  </>
                )}
                <span className="pending-count">{filteredLeaves.length}</span>
              </h3>
              <button
                className="close-filter-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setActiveFilter(null)}
              >
                <X size={15} /> Close
              </button>
            </div>

            {filteredLeaves.length === 0 ? (
              <p className="no-data">No leave requests found in this category.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      {user?.role !== 'employee' && <th>Employee</th>}
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>Reason</th>
                      {user?.role === 'admin' && <th>Manager Status</th>}
                      <th>Status</th>
                      {(user?.role === 'admin' || user?.role === 'manager' || activeFilter === 'pending') && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.map(leave => (
                      <tr key={leave._id}>

                        {/* Employee info */}
                        {user?.role !== 'employee' && (
                          <td>
                            <div className="user-cell">
                              <div
                                className="user-avatar-sm"
                                style={{
                                  background: leave.employee?.role === 'manager' ? '#7C3AED' : '#2563EB'
                                }}
                              >
                                {leave.employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="user-cell-meta">
                                <span className="user-cell-name">{leave.employee?.name}</span>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <span className="user-cell-sub">{leave.employee?.department || 'General'}</span>
                                  {user?.role === 'admin' && (
                                    <span
                                      className={`badge ${leave.employee?.role === 'manager' ? 'badge-purple' : 'badge-blue'}`}
                                      style={{ fontSize: '9px', padding: '1px 6px' }}
                                    >
                                      {leave.employee?.role === 'manager' ? 'Manager' : 'Employee'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        <td>
                          <span className={`chip chip-${leave.leaveType || 'casual'}`}>
                            {leave.leaveType?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="date-range-badge">
                            {new Date(leave.startDate).toLocaleDateString('en-US')} — {new Date(leave.endDate).toLocaleDateString('en-US')}
                          </span>
                        </td>
                        <td>
                          <span className="days-count-pill">
                            {leave.totalDays}d
                          </span>
                        </td>
                        <td className="reason-cell" title={leave.reason}>{leave.reason}</td>

                        {user?.role === 'admin' && (
                          <td>{badge(leave.managerStatus)}</td>
                        )}

                        <td>{badge(leave.status)}</td>

                        {(user?.role === 'admin' || user?.role === 'manager' || activeFilter === 'pending') && (
                          <td>
                            <div className="action-btns" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>

                              {/* MANAGER: Approves/rejects employee leaves */}
                              {user?.role === 'manager' && activeFilter === 'pending' && leave.managerStatus === 'pending' && leave.status !== 'cancelled' && (
                                <>
                                  <button
                                    className="btn-approve"
                                    onClick={() => managerAction(leave._id, 'approved')}
                                  >
                                    <Check size={14} /> Approve
                                  </button>
                                  <button
                                    className="btn-reject"
                                    onClick={() => managerAction(leave._id, 'rejected')}
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </>
                              )}

                              {/* ADMIN: Manages manager leaves, employee leaves are view-only */}
                              {user?.role === 'admin' && activeFilter === 'pending' && (
                                leave.employee?.role === 'manager' ? (
                                  <>
                                    <button
                                      className="btn-approve"
                                      onClick={() => adminAction(leave._id, 'approved')}
                                      title="Approve Manager Leave"
                                    >
                                      <Check size={14} /> Approve
                                    </button>
                                    <button
                                      className="btn-reject"
                                      onClick={() => adminAction(leave._id, 'rejected')}
                                      title="Reject Manager Leave"
                                    >
                                      <X size={14} /> Reject
                                    </button>
                                  </>
                                ) : (
                                  <span className="badge badge-grey" style={{ fontSize: '11px' }} title="Employee leave is managed by their Manager">
                                    Manager Managed
                                  </span>
                                )
                              )}

                              {/* EMPLOYEE: Cancel own pending leave */}
                              {user?.role === 'employee' && activeFilter === 'pending' && (
                                <button
                                  className="btn-reject"
                                  onClick={() => cancelLeave(leave._id)}
                                >
                                  <Ban size={14} /> Cancel
                                </button>
                              )}

                              {/* ADMIN & MANAGER: Permanently Delete Leave Record from Database */}
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteLeave(leave._id)}
                                  title="Permanently delete leave record from database"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              )}

                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- Leave Balance (Employee & Manager) ---- */}
        {(user?.role === 'employee' || user?.role === 'manager') && (
          <div className="card mt-20">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} /> Leave Balance Summary
            </h3>
            <div className="balance-grid">
              <div className="balance-item">
                <span className="balance-type">Casual</span>
                <span className="balance-days">{user?.leaveBalance?.casual ?? 12} days</span>
              </div>
              <div className="balance-item">
                <span className="balance-type">Sick</span>
                <span className="balance-days">{user?.leaveBalance?.sick ?? 10} days</span>
              </div>
              <div className="balance-item">
                <span className="balance-type">Earned</span>
                <span className="balance-days">{user?.leaveBalance?.earned ?? 15} days</span>
              </div>
            </div>
          </div>
        )}

        {/* ---- Quick Actions ---- */}
        <div className="card mt-20">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} /> Quick Actions
          </h3>
          <div className="quick-actions">
            {(user?.role === 'employee' || user?.role === 'manager') && (
              <Link to="/apply-leave" className="action-btn btn-primary">
                <FilePlus2 size={16} /> Apply for Leave
              </Link>
            )}
            {user?.role === 'manager' && (
              <Link to="/team-leaves" className="action-btn btn-manager">
                <Users size={16} /> Review Team Leaves
              </Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/all-leaves"   className="action-btn btn-teal">
                  <ClipboardList size={16} /> All Organization Leaves
                </Link>
                <Link to="/employees?action=add" className="action-btn btn-primary">
                  <UserPlus size={16} /> Add Employee / Manager
                </Link>
                <Link to="/employees"    className="action-btn btn-secondary">
                  <Users size={16} /> Manage Employees
                </Link>
              </>
            )}
          </div>
        </div>

        {/* =============================================
            INLINE PROFILE EDIT MODAL
            ============================================= */}
        {editModalOpen && (
          <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
            <div
              className="modal"
              style={{ maxWidth: '480px', width: '90%' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pencil size={18} /> Edit My Profile
                </h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="auth-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password (Optional)</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep unchanged"
                  />
                </div>

                <div className="form-row" style={{ marginTop: '16px' }}>
                  <button type="submit" className="btn-primary" disabled={editSaving}>
                    {editSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;
