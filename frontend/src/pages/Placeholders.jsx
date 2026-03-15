/**
 * FEMS — Phase 2+ Pages & Placeholders
 */
import { useState, useEffect } from 'react';
import { Plus, Clock, CalendarDays, RefreshCw, X, Edit2, Trash2, MapPin, ClipboardList, Receipt, CalendarCheck, BarChart3, Activity } from 'lucide-react';

/* ── Placeholder Component ───────────────────────────────────── */
export function Placeholder({ icon: Icon, title, description }) {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>{title}</h1><p>{description}</p></div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <Icon size={48} style={{ color: 'var(--primary-400)', opacity: 0.4, marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Coming Soon
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
          The {title} module is under development and will be available in an upcoming release.
        </p>
      </div>
    </div>
  );
}

/* ── Phase 2: Shifts Page ────────────────────────────────────── */
export function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments'); // assignments, types, swaps

  useEffect(() => {
    // Mock data for Phase 2 frontend
    setTimeout(() => {
      setShifts([
        { id: 1, employee: 'Rajesh Kumar', type: 'Morning Shift', date: '2026-03-12', startTime: '06:00', endTime: '14:00', status: 'Scheduled' },
        { id: 2, employee: 'Priya Sharma', type: 'Evening Shift', date: '2026-03-12', startTime: '14:00', endTime: '22:00', status: 'Scheduled' },
        { id: 3, employee: 'Amit Singh', type: 'Night Shift', date: '2026-03-11', startTime: '22:00', endTime: '06:00', status: 'In Progress' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const statusBadge = (status) => {
    if (status === 'In Progress') return <span className="badge badge-active">{status}</span>;
    if (status === 'Scheduled') return <span className="badge badge-pending">{status}</span>;
    return <span className="badge">{status}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Shifts Management</h1>
          <p>Organize shift types, schedule assignments, and approve swaps</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Assign Shift
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        {['assignments', 'types', 'swaps'].map(tab => (
          <button
            key={tab}
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: activeTab === tab ? '2px solid var(--primary-400)' : 'none' }}
            onClick={() => setActiveTab(tab)}
          >
            <span style={{ textTransform: 'capitalize' }}>{tab}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : activeTab === 'assignments' ? (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Shift Type</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(shift => (
                <tr key={shift.id}>
                  <td style={{ fontWeight: 500 }}>{shift.date}</td>
                  <td>{shift.employee}</td>
                  <td>{shift.type}</td>
                  <td>{shift.startTime} - {shift.endTime}</td>
                  <td>{statusBadge(shift.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" title="Edit"><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <Clock size={48} className="empty-icon" />
          <h3>{activeTab === 'types' ? 'Shift Types' : 'Shift Swaps'} coming soon</h3>
          <p>This sub-module will be fully integrated in the next update.</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Shift</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select className="form-select">
                  <option>Rajesh Kumar</option>
                  <option>Priya Sharma</option>
                  <option>Amit Singh</option>
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Shift Type</label>
                  <select className="form-select">
                    <option>Morning (06:00 - 14:00)</option>
                    <option>Evening (14:00 - 22:00)</option>
                    <option>Night (22:00 - 06:00)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Save Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Phase 2: Sites Page ─────────────────────────────────────── */
export function SitesPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      setSites([
        { id: 1, name: 'Main Power Plant', code: 'SIT-001', address: '123 Industrial Rd, City', radius: '500m', status: 'Active', active_workers: 45 },
        { id: 2, name: 'Substation Alpha', code: 'SIT-002', address: '45 Outskirts Ave', radius: '200m', status: 'Active', active_workers: 12 },
        { id: 3, name: 'Downtown Hub', code: 'SIT-003', address: 'Central Business Dist', radius: '100m', status: 'Maintenance', active_workers: 3 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Sites & Geofencing</h1>
          <p>Manage site locations, geofence radius, and assignments</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Add Site</button>
      </div>
      
      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {sites.map(site => (
            <div key={site.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{site.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{site.code}</p>
                  </div>
                </div>
                <span className={`badge ${site.status === 'Active' ? 'badge-active' : 'badge-pending'}`}>{site.status}</span>
              </div>
              
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                <div style={{ marginBottom: 4 }}><strong>Address:</strong> {site.address}</div>
                <div><strong>Geofence Radius:</strong> {site.radius}</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 13, color: 'var(--primary-400)' }}>{site.active_workers} workers on site</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm"><Edit2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Remaining Placeholders ──────────────────────────────────── */

