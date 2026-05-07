import React from 'react';

export default function SitesTab({ siteStats, siteReports }) {
  return (
    <>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Total Sites</p>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>{siteStats.total}</h2>
          <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--primary-400)', borderRadius: 2 }} />
          </div>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Completed</p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--success-400)' }}>{siteStats.completed}</h2>
          <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <div style={{ width: `${siteStats.total ? (siteStats.completed/siteStats.total)*100 : 0}%`, height: '100%', background: 'var(--success-400)', borderRadius: 2 }} />
          </div>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Pending</p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning-400)' }}>{siteStats.pending}</h2>
          <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <div style={{ width: `${siteStats.total ? (siteStats.pending/siteStats.total)*100 : 0}%`, height: '100%', background: 'var(--warning-400)', borderRadius: 2 }} />
          </div>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Need to Visit</p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger-400)' }}>{siteStats.needToVisit}</h2>
          <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <div style={{ width: `${siteStats.total ? (siteStats.needToVisit/siteStats.total)*100 : 0}%`, height: '100%', background: 'var(--danger-400)', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Detailed Site Status</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Location</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {siteReports.map(site => (
                <tr key={site.id}>
                  <td style={{ fontWeight: 600 }}>{site.name}</td>
                  <td>{site.location}</td>
                  <td>{site.manager}</td>
                  <td>
                    <span className={`badge ${
                      site.status === 'Completed' ? 'badge-active' : 
                      site.status === 'Pending' ? 'badge-pending' : 'badge-danger'
                    }`}>
                      {site.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ 
                          width: site.completion, 
                          height: '100%', 
                          background: site.status === 'Completed' ? 'var(--success-400)' : 'var(--primary-400)', 
                          borderRadius: 2 
                        }} />
                      </div>
                      {site.completion}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
