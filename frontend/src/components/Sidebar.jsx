import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus2,
  CalendarDays,
  Users,
  UserCheck,
  ClipboardList,
  User,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // ---- Employee navigation links ----
  const employeeLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/apply-leave', label: 'Apply Leave', icon: FilePlus2 },
    { path: '/my-leaves', label: 'My Leaves', icon: CalendarDays },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  // ---- Manager navigation links ----
  const managerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/apply-leave', label: 'Apply Leave', icon: FilePlus2 },
    { path: '/my-leaves', label: 'My Leaves', icon: CalendarDays },
    { path: '/team-leaves', label: 'Team Leaves', icon: Users },
    { path: '/team-members', label: 'Team Members', icon: UserCheck },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  // ---- Admin navigation links ----
  const adminLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/all-leaves', label: 'All Leaves', icon: ClipboardList },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  // Select navigation links based on user role
  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'manager' ? managerLinks :
    employeeLinks;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">Menu</div>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>
      <ul className="sidebar-menu">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.path}>
              <NavLink
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link active' : 'sidebar-link'
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
