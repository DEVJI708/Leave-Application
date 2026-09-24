// =============================================
// src/pages/Employees.jsx
// Admin: Employees & Managers Management (English)
// Features: Add, Edit, Delete, Leave Balance Assign, Department Filter
// =============================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Wallet,
  Filter,
  Search,
  X,
  UserCheck,
  Building,
  ShieldCheck,
  User,
  Shield,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Add Employee / Manager Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const initialAddState = {
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    managerId: '',
    casualLeave: 12,
    sickLeave: 10,
    earnedLeave: 15
  };
  const [addForm, setAddForm] = useState(initialAddState);

  useEffect(() => {
    fetchEmployees();
    fetchManagers();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add' || searchParams.get('add') === 'true') {
      const targetRole = searchParams.get('role') === 'manager' ? 'manager' : 'employee';
      setAddForm({ ...initialAddState, role: targetRole });
      setIsAddModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const openAddModal = (role = 'employee') => {
    setAddForm({
      ...initialAddState,
      role: role
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) {
      toast.error('Please enter name, email, and password');
      return;
    }
    setAddLoading(true);
    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password,
        role: addForm.role,
        department: addForm.department.trim() || 'General',
        managerId: addForm.role === 'employee' ? (addForm.managerId || null) : null,
        leaveBalance: {
          casual: Number(addForm.casualLeave) || 0,
          sick: Number(addForm.sickLeave) || 0,
          earned: Number(addForm.earnedLeave) || 0
        }
      };

      await API.post('/auth/register', payload);
      toast.success(`${addForm.role === 'manager' ? 'Manager' : 'Employee'} created successfully!`);
      setIsAddModalOpen(false);
      setAddForm(initialAddState);
      fetchEmployees();
      fetchManagers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/users');
      setEmployees(res.data);
    } catch (error) {
      toast.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await API.get('/users/managers');
      setManagers(res.data);
    } catch {}
  };

  // Delete employee
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted successfully!');
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete operation failed');
    }
  };

  // Open Edit Modal
  const openEdit = (emp) => {
    setEditUser({
      _id: emp._id,
      name: emp.name || '',
      email: emp.email || '',
      department: emp.department || 'General',
      role: emp.role || 'employee',
      managerId: emp.manager?._id || emp.manager || '',
      isActive: emp.isActive !== undefined ? emp.isActive : true,
      leaveBalance: {
        casual: emp.leaveBalance?.casual ?? 12,
        sick: emp.leaveBalance?.sick ?? 10,
        earned: emp.leaveBalance?.earned ?? 15
      }
    });
  };

  // Save Edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/users/${editUser._id}`, {
        name: editUser.name,
        email: editUser.email,
        department: editUser.department,
        role: editUser.role,
        managerId: editUser.role === 'employee' ? (editUser.managerId || null) : null,
        isActive: editUser.isActive,
        leaveBalance: editUser.leaveBalance
      });
      toast.success('User updated and leave balance assigned successfully!');
      setEditUser(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const roleBadge = (role) => {
    const colors = { manager: 'badge-purple', employee: 'badge-blue' };
    return <span className={`badge ${colors[role] || 'badge-grey'}`} style={{ border: 'none' }}>{role?.toUpperCase()}</span>;
  };

  const roleAvatarBg = {
    manager: '#7C3AED',
    employee: '#2563EB'
  };

  // Staff members only (Exclude Admin from employee list)
  const staffList = employees.filter(e => e.role !== 'admin');

  // Stats calculation
  const totalStaff = staffList.length;
  const employeesCount = staffList.filter(e => e.role === 'employee').length;
  const managersCount = staffList.filter(e => e.role === 'manager').length;
  const activeCount = staffList.filter(e => e.isActive).length;

  // Filter logic
  const departments = Array.from(new Set(staffList.map(e => e.department).filter(Boolean)));
  const filteredEmployees = staffList.filter(emp => {
    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    if (deptFilter !== 'all' && emp.department !== deptFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = emp.name?.toLowerCase().includes(term);
      const matchEmail = emp.email?.toLowerCase().includes(term);
      const matchDept = emp.department?.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchDept) return false;
    }
    return true;
  });

  const hasActiveFilters = roleFilter !== 'all' || deptFilter !== 'all' || searchTerm !== '';

  const resetFilters = () => {
    setRoleFilter('all');
    setDeptFilter('all');
    setSearchTerm('');
  };

  if (loading) return <Layout><div className="loading">Loading employees...</div></Layout>;

  return (
    <Layout>
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">
            <Users size={24} color="#2563EB" /> Employees & Managers Directory
          </h2>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openAddModal('employee')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={16} /> Add Employee / Manager
          </button>
        </div>

        {/* KPI Stats Cards */}
        <div className="stats-grid" style={{ marginBottom: '22px' }}>
          <div
            className={`stat-card blue ${roleFilter === 'all' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setRoleFilter('all')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Total Staff</div>
                <div className="stat-num">{totalStaff}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Users size={22} />
              </div>
            </div>
          </div>

          <div
            className={`stat-card blue ${roleFilter === 'employee' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setRoleFilter(prev => prev === 'employee' ? 'all' : 'employee')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Employees</div>
                <div className="stat-num">{employeesCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                <User size={22} />
              </div>
            </div>
          </div>

          <div
            className={`stat-card purple ${roleFilter === 'manager' ? 'stat-card-active' : 'stat-card-clickable'}`}
            onClick={() => setRoleFilter(prev => prev === 'manager' ? 'all' : 'manager')}
          >
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Managers</div>
                <div className="stat-num">{managersCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#FAF5FF', color: '#7C3AED' }}>
                <ShieldCheck size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Active Staff</div>
                <div className="stat-num">{activeCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar Card */}
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
                placeholder="Search staff by name, email, or dept..."
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
                <option value="all">All Staff (Employees & Managers)</option>
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

        {/* Employees Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={28} />
              </div>
              <div className="empty-state-title">No Staff Members Found</div>
              <div className="empty-state-desc">
                {hasActiveFilters
                  ? 'No employees match your active search or filter criteria.'
                  : 'No employee records are available in the organization.'}
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
                    <th>Staff Member</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Reporting Manager</th>
                    <th>Leave Quota (C / S / E)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id}>
                      {/* Staff Member */}
                      <td>
                        <div className="user-cell">
                          <div
                            className="user-avatar-sm"
                            style={{ background: roleAvatarBg[emp.role] || '#2563EB' }}
                          >
                            {emp.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="user-cell-meta">
                            <span className="user-cell-name">{emp.name}</span>
                            <span className="user-cell-sub">{emp.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: '#334155' }}>
                          <Building size={14} style={{ color: '#64748B' }} />
                          {emp.department || 'General'}
                        </span>
                      </td>

                      {/* Role */}
                      <td>{roleBadge(emp.role)}</td>

                      {/* Reporting Manager */}
                      <td>
                        {emp.role === 'admin' ? (
                          <span className="badge badge-grey">Root Admin</span>
                        ) : emp.role === 'manager' ? (
                          <span className="badge badge-purple">Admin Direct</span>
                        ) : emp.manager?.name ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                            <UserCheck size={13} style={{ color: '#64748B' }} />
                            {emp.manager.name}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Unassigned</span>
                        )}
                      </td>

                      {/* Leave Balances */}
                      <td>
                        <div className="leave-chips-group">
                          <span className="chip chip-casual" title="Casual Leave Balance">
                            C: {emp.leaveBalance?.casual ?? 0}
                          </span>
                          <span className="chip chip-sick" title="Sick Leave Balance">
                            S: {emp.leaveBalance?.sick ?? 0}
                          </span>
                          <span className="chip chip-earned" title="Earned Leave Balance">
                            E: {emp.leaveBalance?.earned ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-warning-sm"
                            onClick={() => openEdit(emp)}
                            title="Edit details and assign leave balance"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            className="btn-danger-sm"
                            onClick={() => handleDelete(emp._id, emp.name)}
                            title="Delete user"
                          >
                            <Trash2 size={12} /> Delete
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

        {/* ---- Comprehensive Edit Modal ---- */}
        {editUser && (
          <div className="modal-overlay" onClick={() => setEditUser(null)}>
            <div className="modal" style={{ maxWidth: '620px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <Pencil size={18} color="#2563EB" /> Edit User & Assign Leaves
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setEditUser(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={editUser.department}
                      onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {editUser.role === 'employee' && (
                  <div className="form-group">
                    <label>Assign Reporting Manager</label>
                    <select
                      value={editUser.managerId}
                      onChange={(e) => setEditUser({ ...editUser, managerId: e.target.value })}
                    >
                      <option value="">-- No Manager Assigned --</option>
                      {managers.filter(m => m._id !== editUser._id).map((m) => (
                        <option key={m._id} value={m._id}>{m.name} ({m.department})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Account Status</label>
                  <select
                    value={editUser.isActive ? 'true' : 'false'}
                    onChange={(e) => setEditUser({ ...editUser, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Active (Account is enabled)</option>
                    <option value="false">Inactive (Suspended account)</option>
                  </select>
                </div>

                {/* Leave Balance Assignment Section */}
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', margin: '10px 0', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Wallet size={16} color="#0891B2" /> Assign Leave Balance (Days Available)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>Casual Leave</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={editUser.leaveBalance.casual}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          leaveBalance: { ...editUser.leaveBalance, casual: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B21A8', display: 'block', marginBottom: '4px' }}>Sick Leave</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={editUser.leaveBalance.sick}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          leaveBalance: { ...editUser.leaveBalance, sick: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#166534', display: 'block', marginBottom: '4px' }}>Earned Leave</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={editUser.leaveBalance.earned}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          leaveBalance: { ...editUser.leaveBalance, earned: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---- Add Employee / Manager Modal ---- */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={() => !addLoading && setIsAddModalOpen(false)}>
            <div className="modal" style={{ maxWidth: '640px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={18} color="#2563EB" />
                  Add New {addForm.role === 'manager' ? 'Manager' : 'Employee'}
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={() => !addLoading && setIsAddModalOpen(false)}
                  title="Close modal"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Role Toggle Selector */}
              <div style={{
                display: 'flex',
                background: '#F1F5F9',
                padding: '4px',
                borderRadius: '8px',
                marginBottom: '16px',
                gap: '6px'
              }}>
                <button
                  type="button"
                  onClick={() => setAddForm(prev => ({ ...prev, role: 'employee' }))}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: addForm.role === 'employee' ? '#FFFFFF' : 'transparent',
                    color: addForm.role === 'employee' ? '#2563EB' : '#64748B',
                    boxShadow: addForm.role === 'employee' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <User size={15} /> Add Employee
                </button>
                <button
                  type="button"
                  onClick={() => setAddForm(prev => ({ ...prev, role: 'manager', managerId: '' }))}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: addForm.role === 'manager' ? '#FFFFFF' : 'transparent',
                    color: addForm.role === 'manager' ? '#7C3AED' : '#64748B',
                    boxShadow: addForm.role === 'manager' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ShieldCheck size={15} /> Add Manager
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="auth-form">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="user@company.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Initial Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create login password"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Engineering, Sales, HR"
                      value={addForm.department}
                      onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    />
                  </div>

                  {addForm.role === 'employee' ? (
                    <div className="form-group">
                      <label>Reporting Manager</label>
                      <select
                        className="filter-select"
                        value={addForm.managerId}
                        onChange={(e) => setAddForm({ ...addForm, managerId: e.target.value })}
                      >
                        <option value="">-- Select Reporting Manager --</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.department || 'General'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <label style={{ color: '#64748B' }}>Reporting Line</label>
                      <div style={{
                        padding: '9px 12px',
                        background: '#FAF5FF',
                        border: '1px solid #E9D5FF',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#7C3AED',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <ShieldCheck size={15} /> Reports directly to Administrator
                      </div>
                    </div>
                  )}
                </div>

                {/* Annual Leave Quota Allocation */}
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', margin: '10px 0', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Wallet size={15} color="#0891B2" /> Annual Leave Quota Allocation (Days)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>Casual Leave</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={addForm.casualLeave}
                        onChange={(e) => setAddForm({ ...addForm, casualLeave: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B21A8', display: 'block', marginBottom: '4px' }}>Sick Leave</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={addForm.sickLeave}
                        onChange={(e) => setAddForm({ ...addForm, sickLeave: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#166534', display: 'block', marginBottom: '4px' }}>Earned Leave</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={addForm.earnedLeave}
                        onChange={(e) => setAddForm({ ...addForm, earnedLeave: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={addLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={addLoading}
                    style={{
                      background: addForm.role === 'manager'
                        ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                        : undefined,
                      borderColor: addForm.role === 'manager' ? '#6D28D9' : undefined
                    }}
                  >
                    <UserPlus size={15} />
                    {addLoading
                      ? 'Creating Account...'
                      : `Create ${addForm.role === 'manager' ? 'Manager' : 'Employee'}`}
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

export default Employees;
