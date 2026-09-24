// =============================================
// src/pages/MyLeaves.jsx
// Personal Leave Application History (English)
// =============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  CalendarDays,
  Ban,
  FilePlus2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Layers,
  MessageSquare
} from 'lucide-react';

const MyLeaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/leaves/my');
      setLeaves(res.data);
    } catch (error) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  // Cancel pending leave
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await API.put(`/leaves/${id}/cancel`);
      toast.success('Leave application cancelled successfully!');
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const statusClass = {
    approved: 'badge-success',
    rejected: 'badge-danger',
    pending: 'badge-warning',
    cancelled: 'badge-grey'
  };

  const isManager = user?.role === 'manager';

  // Stats
  const totalCount = leaves.length;
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

  if (loading) return <Layout><div className="loading">Loading leave history...</div></Layout>;

  return (
    <Layout>
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">
            <CalendarDays size={24} color="#2563EB" /> My Leave Applications
          </h2>
          {(user?.role === 'employee' || user?.role === 'manager') && (
            <Link to="/apply-leave" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilePlus2 size={16} /> Apply for New Leave
            </Link>
          )}
        </div>

        {/* Mini KPI Stats Cards */}
        <div className="stats-grid" style={{ marginBottom: '22px' }}>
          <div className="stat-card blue">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Total Submitted</div>
                <div className="stat-num">{totalCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <ClipboardList size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Pending Approval</div>
                <div className="stat-num">{pendingCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <div className="stat-label">Approved</div>
                <div className="stat-num">{approvedCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card red">
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

        {/* Leave Applications Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {leaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Layers size={28} />
              </div>
              <div className="empty-state-title">No Leave Applications Found</div>
              <div className="empty-state-desc">You haven't submitted any leave applications yet. Need time off?</div>
              {(user?.role === 'employee' || user?.role === 'manager') && (
                <Link to="/apply-leave" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FilePlus2 size={16} /> Apply Now
                </Link>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason & Remarks</th>
                    <th>{isManager ? 'Admin Review' : 'Manager Review'}</th>
                    <th>Final Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => {
                    const reviewerStatus = isManager ? leave.adminStatus : leave.managerStatus;
                    const remark = isManager ? leave.adminRemark : leave.managerRemark;

                    return (
                      <tr key={leave._id}>
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

                        {/* Total Days */}
                        <td>
                          <span className="days-count-pill">
                            {leave.totalDays}d
                          </span>
                        </td>

                        {/* Reason & Remarks */}
                        <td className="reason-cell" title={leave.reason}>
                          <div style={{ fontWeight: 500 }}>{leave.reason}</div>
                          {remark && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#F8FAFC',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              color: '#64748B',
                              marginTop: '4px',
                              border: '1px solid #E2E8F0'
                            }}>
                              <MessageSquare size={11} /> Remark: <em>{remark}</em>
                            </div>
                          )}
                        </td>

                        {/* Reviewer Status */}
                        <td>
                          <span className={`badge ${statusClass[reviewerStatus] || 'badge-grey'}`}>
                            {reviewerStatus ? reviewerStatus.toUpperCase() : 'PENDING'}
                          </span>
                        </td>

                        {/* Final Status */}
                        <td>
                          <span className={`badge ${statusClass[leave.status] || 'badge-grey'}`}>
                            {leave.status?.toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          {leave.status === 'pending' && (
                            <button
                              className="btn-danger-sm"
                              onClick={() => handleCancel(leave._id)}
                              title="Cancel pending application"
                            >
                              <Ban size={13} /> Cancel
                            </button>
                          )}
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

export default MyLeaves;
