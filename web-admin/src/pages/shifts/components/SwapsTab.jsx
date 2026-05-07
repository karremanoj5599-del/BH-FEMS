import React from 'react';

export default function SwapsTab({ displaySwaps, isEmployee, user, handleSwapAction }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Historical & Pending Swaps</h3>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Requester</th>
              <th>Swap Partner</th>
              <th>For Date</th>
              <th>Status</th>
              <th>Approver</th>
              <th>Processed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displaySwaps.map(swap => {
              const canApprove = user?.role_name === 'Admin' || 
                (swap.requester_obj?.team_id === user?.team_id && swap.requester_obj?.team_id !== null) ||
                (swap.requester_obj?.supervisor_id === user?.id);

              return (
                <tr key={swap.id}>
                  <td>#SWP-{swap.id}</td>
                  <td style={{ fontWeight: 600 }}>{swap.requester}</td>
                  <td style={{ fontWeight: 600 }}>{swap.partner}</td>
                  <td>{swap.date}</td>
                  <td>
                    <span className={`badge ${swap.status === 'Approved' ? 'badge-active' : swap.status === 'Rejected' ? 'badge-danger' : 'badge-pending'}`}>
                      {swap.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{swap.approver_name}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{swap.processed_at}</td>
                  <td>
                    {!isEmployee && swap.status === 'Pending' && canApprove && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSwapAction(swap.id, 'Approved')}>Approve</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleSwapAction(swap.id, 'Rejected')}>Reject</button>
                      </div>
                    )}
                    {!isEmployee && swap.status === 'Pending' && !canApprove && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Other Team</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
