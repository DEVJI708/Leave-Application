// =============================================
// src/components/Navbar.jsx
// Top Navigation Bar
// =============================================

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck2, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role badge colors
  const roleBadgeColor = {
    admin: '#DC2626',
    manager: '#F59E0B',
    employee: '#16A34A'
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div
          className="navbar-brand"
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
          title="Go to Dashboard"
        >
          <CalendarCheck2 size={22} />
          <span>Leave System</span>
        </div>
      </div>

      <div className="navbar-user">
        {/* Right side profile avatar & name - Click opens Profile */}
        <div
          className="user-profile-btn"
          onClick={() => navigate('/profile')}
          title="Click to view & edit Profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '5px 12px 5px 6px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            transition: 'all 0.2s',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: roleBadgeColor[user?.role] || '#3B82F6',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '13px' }}>
            {user?.name}
          </span>

          <span
            className="role-badge"
            style={{
              background: roleBadgeColor[user?.role],
              fontSize: '10px',
              padding: '2px 8px',
              fontWeight: 700
            }}
          >
            {user?.role?.toUpperCase()}
          </span>
        </div>

        <button className="btn-logout" onClick={handleLogout} title="Logout">
          <LogOut size={14} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
