import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Search, Filter, Edit2, Trash2, 
  Map as MapIcon, Users, AlertTriangle, CheckCircle,
  ExternalLink, Phone, Mail, Navigation, ChevronRight, X
} from 'lucide-react';
import api from '../../services/api';

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [view, setView] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState({}); // siteId -> employeeIds[]

  const fetchData = async () => {
    setLoading(true);
    try {
      const [siteRes, empRes] = await Promise.all([
        api.get('/sites/'),
        api.get('/employees/', { params: { page_size: 100 } })
      ]);
      setSites(siteRes.data || []);
      setEmployees(empRes.data.items || []);
      
      // Map assignments if available in site data
      const initialAssignments = {};
      (siteRes.data || []).forEach(site => {
        initialAssignments[site.id] = site.assigned_employee_ids || [];
      });
      setAssignments(initialAssignments);
    } catch (err) {
      console.error("Failed to fetch site data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleAssignment = async (siteId, empId) => {
    try {
      const current = assignments[siteId] || [];
      const updated = current.includes(empId)
        ? current.filter(id => id !== empId)
        : [...current, empId];
      
      await api.patch(`/sites/${siteId}`, { assigned_employee_ids: updated });
      setAssignments(prev => ({ ...prev, [siteId]: updated }));
    } catch (err) {
      console.error("Failed to update assignments:", err);
      alert("Failed to update assignments. Please try again.");
    }
  };

  const [assignmentSearch, setAssignmentSearch] = useState('');

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      Active: 'badge-active',
      Inactive: 'badge-pending',
      Archived: 'badge-danger'
    };
    return <span className={`badge ${colors[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Sites & Geofencing</h1>
          <p>Advanced site management with GPS integration and real-time tracking.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="btn-group" style={{ background: 'var(--surface-2)', padding: 4, borderRadius: 10, display: 'flex' }}>
            <button 
              className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setView('grid')}
            >
              List
            </button>
            <button 
              className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setView('map')}
            >
              Map
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { setSelectedSite(null); setShowModal(true); }}>
            <Plus size={16} /> Add New Site
          </button>
        </div>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <>
          {/* Filters */}
          <div className="card" style={{ marginBottom: 20, padding: '12px 20px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input type="text" className="form-input" placeholder="Search sites..." style={{ paddingLeft: 40 }} />
              </div>
              <select className="form-select" style={{ width: 150 }}><option>All Types</option></select>
            </div>
          </div>

          {view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
              {sites.map(site => (
                <div key={site.id} className="card site-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 100, background: 'var(--surface-3)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapIcon size={40} style={{ opacity: 0.1 }} />
                    <div style={{ position: 'absolute', top: 12, right: 12 }}><StatusBadge status={site.status} /></div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{site.name}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{site.site_id}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedSite(site); setShowModal(true); }}><Edit2 size={14} /></button>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                      <Navigation size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      {site.address}
                    </div>

                    <div className="card" style={{ background: 'var(--surface-2)', padding: '12px', marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Assigned Staff</span>
                        <span>{(assignments[site.id] || []).length} people</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(assignments[site.id] || []).slice(0, 3).map(empId => {
                          const emp = employees.find(e => e.id === empId);
                          return emp ? (
                            <div key={empId} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-400)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }} title={emp.name}>
                              {emp.name.charAt(0)}
                            </div>
                          ) : null;
                        })}
                        {(assignments[site.id] || []).length > 3 && (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>
                            +{(assignments[site.id] || []).length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="btn btn-ghost btn-block" style={{ fontSize: 13 }} onClick={() => { setSelectedSite(site); setShowModal(true); }}>
                      <Users size={14} style={{ marginRight: 8 }} /> Manage Assignments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', opacity: 0.5 }}>
                <MapIcon size={64} />
                <p>Map View Active</p>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSite ? `Assignments: ${selectedSite.name}` : 'Create New Site'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
              {/* Site Info Column */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Site Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Site Name</label>
                    <input type="text" className="form-input" defaultValue={selectedSite?.name} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Site ID</label>
                    <input type="text" className="form-input" defaultValue={selectedSite?.site_id} />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Full Address</label>
                  <textarea className="form-input" rows={2} defaultValue={selectedSite?.address} />
                </div>
                <div style={{ marginTop: 24 }}>
                   <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} color="var(--warning-400)" /> Geofence Configuration
                    </div>
                    <div className="card" style={{ background: 'var(--surface-2)', padding: 16 }}>
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        Radius <span>{selectedSite?.geofence_radius || 100}m</span>
                      </label>
                      <input type="range" min="50" max="1000" step="50" className="form-input" style={{ padding: 0 }} />
                    </div>
                </div>
              </div>

              {/* Assignment Column */}
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Assign Employees</h3>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Search staff..." 
                      style={{ paddingLeft: 32, fontSize: 13 }} 
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedSite && filteredEmployees.map(emp => {
                    const isAssigned = (assignments[selectedSite.id] || []).includes(emp.id);
                    return (
                      <div 
                        key={emp.id} 
                        className={`card ${isAssigned ? 'assigned-row' : ''}`}
                        style={{ 
                          padding: '10px 12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isAssigned ? 'rgba(99,102,241,0.08)' : 'var(--surface-2)',
                          borderColor: isAssigned ? 'var(--primary-400)' : 'transparent',
                          borderWidth: 1,
                          borderStyle: 'solid'
                        }}
                        onClick={() => handleToggleAssignment(selectedSite.id, emp.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.designation}</div>
                          </div>
                        </div>
                        {isAssigned && <CheckCircle size={14} color="var(--primary-400)" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .site-card { transition: all 0.3s ease; }
        .site-card:hover { transform: translateY(-4px); border-color: var(--primary-500); }
        .assigned-row { border-color: var(--primary-400) !important; background: rgba(99,102,241,0.05) !important; }
        .btn-group .btn { border-radius: 8px !important; margin: 0; }
        .form-select { width: 100%; padding: 8px 12px; }
      `}</style>
    </div>
  );
}
