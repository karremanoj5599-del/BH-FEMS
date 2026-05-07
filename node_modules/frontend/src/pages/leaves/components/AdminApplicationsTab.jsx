import React from 'react';
import { Search, RefreshCw, Check, X, CheckCircle2, XCircle, Clock } from 'lucide-react';

const getStatusBadge = (status) => {
  switch(status) {
    case 'Approved': return <span className="badge badge-active"><CheckCircle2 size={12} /> Approved</span>;
    case 'Rejected': return <span className="badge badge-danger"><XCircle size={12} /> Rejected</span>;
    default: return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
  }
};

export default function AdminApplicationsTab({ filters, setFilters, globalHistory, handleUpdateStatus }) {
  return (
    <div className="animate-fade-in">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Employee Leave History</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search employee..." 
                style={{ width: 220, paddingLeft: 32 }}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <select 
              className="form-select" 
              style={{ width: 140, height: 36, padding: '0 8px' }}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ search: '', status: '' })}><RefreshCw size={14} /></button>
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {globalHistory.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No applications found matching filters.</td></tr>
              ) : (
                globalHistory.map(leave => (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{leave.employee_name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {leave.employee_id}</span>
                      </div>
                    </td>
                    <td>{leave.leave_type_name}</td>
                    <td>{leave.from_date} to {leave.to_date}</td>
                    <td>{getStatusBadge(leave.status)}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</td>
                    <td>
                      {leave.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success-400)' }} onClick={() => handleUpdateStatus(leave.id, 'Approved')}>
                            <Check size={16} />
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleUpdateStatus(leave.id, 'Rejected')}>
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
