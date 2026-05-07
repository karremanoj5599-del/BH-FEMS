import React from 'react';
import { MapIcon, MapPin, Users, Edit, Trash2 } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const colors = {
    Active: 'badge-active',
    Inactive: 'badge-pending',
    Archived: 'badge-danger'
  };
  return <span className={`badge ${colors[status] || ''}`}>{status}</span>;
};

export default function SiteGrid({ filteredSites, assignments, employees, setSelectedSite, setShowModal, handleDeleteSite }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {filteredSites.map(site => (
        <div key={site.id} className="card site-admin-card" style={{ 
          padding: 0, overflow: 'hidden', 
          border: '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: 'var(--surface-2)',
          borderRadius: 16
        }}>
          {/* Top Accent Strip */}
          <div style={{ 
            height: 4, 
            background: site.status === 'Active' ? 'var(--success-500)' : 'var(--border-subtle)',
            opacity: 0.8
          }} />
          
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(99,102,241,0.08)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MapIcon size={22} color="var(--primary-400)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: 6, background: 'var(--surface-3)', 
                      fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-400)' 
                    }}>#{site.site_id}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{site.name}</h3>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {site.address}
                  </div>
                </div>
              </div>
              <StatusBadge status={site.status} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: -8 }}>
                  {(assignments[site.id] || []).slice(0, 3).map((empId, idx) => {
                    const emp = employees.find(e => e.id === empId);
                    return (
                      <div key={empId} style={{ 
                        width: 28, height: 28, borderRadius: '50%', 
                        background: 'var(--primary-500)', border: '2px solid var(--surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: 10, fontWeight: 700, color: 'white', marginLeft: idx === 0 ? 0 : -10,
                        zIndex: 10 - idx
                      }} title={emp?.name}>
                        {emp?.name.charAt(0)}
                      </div>
                    );
                  })}
                  {(assignments[site.id] || []).length > 3 && (
                    <div style={{ 
                      width: 28, height: 28, borderRadius: '50%', 
                      background: 'var(--surface-3)', border: '2px solid var(--surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: 10, fontWeight: 700, marginLeft: -10
                    }}>
                      +{(assignments[site.id] || []).length - 3}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {(assignments[site.id] || []).length} personnel assigned
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ width: 32, height: 32, padding: 0 }} onClick={() => { setSelectedSite(site); setShowModal(true); }} title="Assign Personnel">
                  <Users size={14} />
                </button>
                <button className="btn btn-primary btn-sm" style={{ height: 32, padding: '0 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { setSelectedSite(site); setShowModal(true); }}>
                  <Edit size={14} /> Edit
                </button>
                <button className="btn btn-ghost btn-sm" style={{ width: 32, height: 32, padding: 0 }} onClick={() => handleDeleteSite(site.id)} title="Delete Site">
                  <Trash2 size={14} color="var(--danger-500)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
