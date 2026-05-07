import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  MapPin, Navigation, Building2, Phone, Mail,
  ExternalLink, Clock, Users, AlertCircle, CheckCircle,
  Map as MapIcon, Loader, RefreshCw, Search, Play, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ExecutionTracker from '../../components/ExecutionTracker';

export default function MySitesPage({ mode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSiteId, setExpandedSiteId] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);

  const fetchMySites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/sites/my-sites');
      setSites(res.data || []);
    } catch (err) {
      console.error('Failed to fetch my sites:', err);
      setError('Failed to load your assigned sites.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await api.get('/attendance/site/active-sessions');
      const sessions = res.data.sessions || [];
      setActiveSessions(sessions);
      // Auto-expand any site that has an active session
      const activeSiteSession = sessions.find(s => s.site_id);
      if (activeSiteSession) {
        setExpandedSiteId(activeSiteSession.site_id);
      }
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
    }
  };

  useEffect(() => {
    fetchMySites();
    fetchActiveSessions();
  }, []);

  const filteredSites = sites.filter(site => {
    const matchesSearch = 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.site_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (mode === 'completed') {
      return ['Completed', 'Finished'].includes(site.execution_status);
    }
    
    return true;
  });

  const openInMaps = (lat, long) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${long}`, '_blank');
  };

  const getActiveSession = (siteId) => {
    return activeSessions.find(s => s.site_id === siteId);
  };

  const handleCardClick = (site) => {
    navigate(`/execution/site/${site.id}`);
  };

  const handleExecutionComplete = () => {
    fetchMySites();
    fetchActiveSessions();
    setExpandedSiteId(null);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      Active: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
      Inactive: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    };
    const style = colors[status] || colors.Active;
    return (
      <span style={{
        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.color }} />
        {status}
      </span>
    );
  };

  const SessionBadge = ({ session }) => {
    if (!session) return null;
    const statusColors = {
      'En Route': { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', border: 'rgba(99,102,241,0.25)' },
      'On Site': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
      'Completed': { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    };
    const s = statusColors[session.status] || statusColors['En Route'];
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        display: 'inline-flex', alignItems: 'center', gap: 4, animation: 'pulse 2s infinite',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
        {session.status}
      </span>
    );
  };

  return (
    <div className="animate-fade-in my-sites-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={24} color="var(--primary-400)" />
            {mode === 'completed' ? 'My Completed Sites' : 'My Assigned Sites'}
          </h1>
          <p>{mode === 'completed' ? 'Historical overview of sites you have completed today.' : 'View and manage your assigned sites. Click a card to start the execution workflow.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => { fetchMySites(); fetchActiveSessions(); }} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="card" style={{ marginBottom: 20, padding: 6, display: 'flex', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
        <NavLink to="/my-sites" end className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, gap: 8 }}>
          <MapPin size={14} /> My Sites
        </NavLink>
        <NavLink to="/my-sites/completed" className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, gap: 8 }}>
          <CheckCircle size={14} /> My Completed Sites
        </NavLink>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="var(--primary-400)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{sites.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total Sites</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{sites.filter(s => s.status === 'Active').length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Active Sites</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={22} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{activeSessions.filter(s => s.site_id).length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>In Progress</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 20, padding: '10px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search your sites by name, ID, or address..."
            style={{ paddingLeft: 40 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="loading-spinner"><div className="spinner" /></div>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
          <AlertCircle size={40} color="var(--danger-400)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{error}</h3>
          <button className="btn btn-primary" onClick={fetchMySites}>Try Again</button>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 80 }}>
          <MapIcon size={56} style={{ opacity: 0.15, marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {searchQuery ? 'No matching sites' : 'No Sites Assigned Yet'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {searchQuery
              ? 'Try a different search term.'
              : 'Your admin hasn\'t assigned any sites to you yet. Check back later!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredSites.map(site => {
            const isExpanded = expandedSiteId === site.id;
            const activeSession = getActiveSession(site.id);

            return (
              <div key={site.id} className="card site-card" style={{
                padding: 0, overflow: 'hidden',
                border: isExpanded ? '1px solid var(--primary-400)' : activeSession ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border-subtle)',
                boxShadow: isExpanded ? '0 0 0 3px rgba(99,102,241,0.12)' : activeSession ? '0 0 0 2px rgba(245,158,11,0.1)' : 'none',
              }}>
                {/* Top Accent Strip */}
                <div style={{ 
                  height: 4, 
                  background: activeSession ? '#f59e0b' : site.status === 'Active' ? 'var(--success-500)' : 'var(--border-subtle)',
                  opacity: 0.8
                }} />

                {/* Card Header — always visible */}
                <div
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: activeSession ? 'linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 100%)' : 'transparent',
                  }}
                  onClick={() => handleCardClick(site)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    {/* Site icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: activeSession ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MapPin size={22} color={activeSession ? '#f59e0b' : 'var(--primary-400)'} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{
                          background: 'rgba(99,102,241,0.1)', color: 'var(--primary-400)',
                          padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: 'monospace'
                        }}>
                          {site.site_id}
                        </span>
                        <StatusBadge status={site.status} />
                        <SessionBadge session={activeSession} />
                        {site.task_count > 0 && (
                          <span style={{
                            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-500)',
                            padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 4
                          }}>
                            <ClipboardList size={10} /> {site.task_count} Tasks
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{site.name}</h3>
                      {site.address && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} style={{ flexShrink: 0 }} />
                          {site.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {site.lat && site.long && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ borderRadius: 8, fontSize: 11 }}
                        onClick={(e) => { e.stopPropagation(); openInMaps(site.lat, site.long); }}
                        title="Open in Maps"
                      >
                        <Navigation size={13} />
                      </button>
                    )}
                    {site.contact_person_phone && (
                      <a
                        href={`tel:${site.contact_person_phone}`}
                        className="btn btn-ghost btn-sm"
                        style={{ borderRadius: 8 }}
                        onClick={(e) => e.stopPropagation()}
                        title="Call Contact"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                    <div style={{
                      transition: 'transform 0.2s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: 'var(--text-muted)',
                    }}>
                      ▾
                    </div>
                  </div>
                </div>

                {/* Removed Inline Execution Tracker */}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .my-sites-page .site-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .my-sites-page .site-card:hover {
          border-color: var(--primary-400) !important;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
