import React from 'react';
import { AlertCircle, Plus, Star, Check, X } from 'lucide-react';

export default function BiddingTab({ displayBids, isAdmin, onGrantPoints, onBidAction }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Active Bidding Round: Night Shifts Q2</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Employee</th>
                <th>Shift Type</th>
                <th>Preference Points</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayBids.map(bid => (
                <tr key={bid.id}>
                  <td>#{bid.priority}</td>
                  <td style={{ fontWeight: 600 }}>{bid.employee}</td>
                  <td>{bid.type}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{bid.points} pts</td>
                  <td>
                    <span className={`badge ${bid.status === 'Confirmed' ? 'badge-active' : 'badge-pending'}`}>
                      {bid.status}
                    </span>
                  </td>
                   {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {bid.status === 'Pending' && (
                          <>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ color: 'var(--success-400)', padding: '4px 8px' }}
                              title="Approve Bid"
                              onClick={() => onBidAction(bid.id, 'Confirmed')}
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ color: 'var(--danger-400)', padding: '4px 8px' }}
                              title="Reject Bid"
                              onClick={() => onBidAction(bid.id, 'Rejected')}
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ color: 'var(--primary-400)', padding: '4px 8px', gap: 4 }}
                          onClick={() => onGrantPoints(bid)}
                        >
                          <Plus size={14} /> Give Pts
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Bidding Rules</h3>
        <ul style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 16 }}>
          <li>Employees get 200 points per quarter.</li>
          <li>High points increase priority for popular shifts.</li>
          <li>Auto-assignment kicks in if no bids are placed.</li>
          <li>Conflict detected for: <strong>Amit Singh</strong> (Continuous hours limit).</li>
        </ul>
         <div className="alert alert-warning" style={{ marginTop: 20, display: 'flex', gap: 10, padding: 12, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
            <AlertCircle size={16} color="var(--warning-400)" />
            <div style={{ fontSize: 12, color: 'var(--warning-400)' }}>
              <strong>Safety Alert:</strong> Max 14 continuous hours policy is being enforced.
            </div>
         </div>
      </div>
    </div>
  );
}
