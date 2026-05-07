/**
 * FEMS — Top Bar
 * Search, notifications bell, and user profile dropdown.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, Bell, LogOut, User, Settings } from 'lucide-react';

const NOTIFICATIONS = [
  { id: 1, title: 'Check-in Alert', message: 'Rajesh Kumar clocked in at Site SIT-001', time: '2 mins ago', type: 'info' },
  { id: 2, title: 'Task Overdue', message: 'Substation Alpha maintenance is 3 hours overdue', time: '1 hour ago', type: 'danger' },
  { id: 3, title: 'Leave Update', message: 'Your Casual Leave request was approved', time: '5 hours ago', type: 'success' },
];

export default function TopBar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={`topbar ${collapsed ? 'collapsed' : ''}`}>
      <div className="topbar-left">
        <button className="topbar-toggle" onClick={onToggle}>
          <Menu size={20} />
        </button>
        <div className="topbar-search">
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Search employees, sites, tasks..." />
        </div>
      </div>

      <div className="topbar-right">
        <div style={{ position: 'relative' }}>
          <button 
            className="topbar-btn" 
            title="Notifications"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
          >
            <Bell size={20} />
            <span className="badge-dot" />
          </button>

          {showNotifDropdown && (
            <div className="card" style={{
              position: 'absolute', top: '120%', right: 0, 
              width: 320, padding: 0, zIndex: 1000,
              boxShadow: 'var(--shadow-xl)', overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Notifications</span>
                <span style={{ fontSize: 11, color: 'var(--primary-400)' }}>Mark all as read</span>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} style={{ padding: 12, borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} className="nav-item">
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ 
                        width: 8, height: 8, borderRadius: '50%', marginTop: 6,
                        background: n.type === 'danger' ? 'var(--danger-400)' : 'var(--primary-400)' 
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 10, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                View all notifications
              </div>
            </div>
          )}
        </div>

        <div
          className="topbar-user"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          style={{ position: 'relative' }}
        >
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role_name || 'Employee'}</span>
          </div>

          {showUserDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                minWidth: 180,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
              }}
            >
              <button className="nav-item" style={{ width: '100%' }} onClick={() => { setShowUserDropdown(false); }}>
                <User size={16} /> Profile
              </button>
              <button className="nav-item" style={{ width: '100%' }} onClick={() => { setShowUserDropdown(false); }}>
                <Settings size={16} /> Settings
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
              <button className="nav-item" style={{ width: '100%', color: 'var(--danger-400)' }} onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
