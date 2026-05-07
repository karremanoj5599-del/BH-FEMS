import React from 'react';
import { ArrowUpRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const getStatusBadge = (status) => {
  switch(status) {
    case 'Approved': return <span className="badge badge-active"><CheckCircle2 size={12} /> Approved</span>;
    case 'Rejected': return <span className="badge badge-danger"><XCircle size={12} /> Rejected</span>;
    default: return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
  }
};

export default function MyLeavesTab({ balances, myLeaves }) {
  return (
    <div className="animate-fade-in">
      <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {balances.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: 12 }}>No leave balances initialized.</p>
        ) : (
          balances.map(b => (
            <div key={b.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: 'var(--primary-400)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{b.leave_type_name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700 }}>{b.remaining}</h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {b.accrued} days available</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No leave history found.</td></tr>
              ) : (
                myLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td><span style={{ fontWeight: 600 }}>{leave.leave_type_name || 'Personal'}</span></td>
                    <td>{leave.from_date} to {leave.to_date}</td>
                    <td>{leave.days || '-'}</td>
                    <td>{leave.reason}</td>
                    <td>{getStatusBadge(leave.status)}</td>
                    <td><button className="btn btn-ghost btn-sm"><ArrowUpRight size={14} /></button></td>
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
