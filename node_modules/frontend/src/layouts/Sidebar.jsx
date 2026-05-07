/**
 * FEMS — Sidebar Navigation
 * Role-based menu with collapsible sidebar.
 */
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, UsersRound, Clock, MapPin, Navigation,
  ClipboardList, Receipt, CalendarDays, CalendarCheck, BarChart3,
  Shield, Activity, ChevronLeft, ChevronRight, Plus, CheckCircle
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', perm: 'dashboard' },
      { to: '/portal', icon: LayoutDashboard, label: 'My Portal', perm: 'always' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/employees', icon: Users, label: 'Employees', perm: 'employees' },
      { to: '/departments', icon: Building2, label: 'Departments', perm: 'departments' },
      { to: '/teams', icon: UsersRound, label: 'Teams', perm: 'teams' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/shifts', icon: Clock, label: 'Shifts', perm: 'shifts' },
      { to: '/my-shifts', icon: Clock, label: 'My Shifts', perm: 'always' },
      { to: '/sites', icon: MapPin, label: 'Sites', perm: 'sites' },
      { to: '/my-sites', icon: MapPin, label: 'My Sites', perm: 'always' },
      { to: '/attendance', icon: Navigation, label: 'Attendance', perm: 'attendance' },
      { to: '/tasks', icon: ClipboardList, label: 'Tasks', perm: 'tasks' },
      { to: '/expenses', icon: Receipt, label: 'Expenses', perm: 'expenses' },
    ],
  },
  {
    label: 'HR',
    items: [
      { to: '/leaves', icon: CalendarDays, label: 'Leaves', perm: 'leaves' },
      { to: '/holidays', icon: CalendarCheck, label: 'Holidays', perm: 'holidays' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/reports', icon: BarChart3, label: 'Reports', perm: 'reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/roles', icon: Shield, label: 'Roles & Access', perm: 'roles' },
      { to: '/logs', icon: Activity, label: 'Activity Logs', perm: 'logs' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { hasPermission, hasRole } = useAuth();
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">F</div>
        {!collapsed && <span className="logo-text">FEMS</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.perm === 'always') return true;
            
            // Special case for administrative modules
            const adminOnlyPerms = ['employees', 'departments', 'teams', 'shifts', 'sites', 'reports', 'roles', 'logs'];
            if (adminOnlyPerms.includes(item.perm)) {
              return hasRole(['Admin', 'HR', 'Manager', 'Supervisor']);
            }

            return hasPermission(item.perm) || hasPermission(`my_${item.perm}`);
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              {!collapsed && (
                <div className="nav-section-label">{section.label}</div>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  end={item.to === '/'}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="nav-icon" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        className="nav-item"
        onClick={onToggle}
        style={{ margin: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}
      >
        {collapsed ? <ChevronRight className="nav-icon" /> : <ChevronLeft className="nav-icon" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
