/**
 * FEMS — Main Layout
 * Wraps sidebar + topbar + content area for authenticated pages.
 */
import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopBar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="page-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
