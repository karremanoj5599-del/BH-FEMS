import React from 'react';
import { X, Eye, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

const getStatusBadge = (status) => {
  switch(status) {
    case 'Approved': return <span className="badge badge-active"><CheckCircle2 size={12} /> Approved</span>;
    case 'Rejected': return <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-400)' }}><XCircle size={12} /> Rejected</span>;
    default: return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
  }
};

export default function ExpenseDetailModal({ 
  selectedExpense, setShowDetailModal, 
  activeTab, handleAction 
}) {
  if (!selectedExpense) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
        <div className="modal-header">
          <h2>Claim Details</h2>
          <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            <div>
               <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Receipt Attachment</label>
                  <div className="card" style={{ height: 300, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0, borderStyle: 'dashed' }}>
                    {selectedExpense.receipt ? (
                      <div 
                        style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
                        onClick={() => {
                          const newWindow = window.open();
                          newWindow.document.write(`
                            <title>Receipt Preview</title>
                            <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">
                              <img src="${selectedExpense.receipt}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                            </body>
                          `);
                        }}
                      >
                        <img 
                          src={selectedExpense.receipt} 
                          alt="receipt" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{ 
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s'
                        }} className="image-hover-overlay">
                           <Eye color="white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <AlertTriangle size={32} style={{ marginBottom: 10 }} />
                        <p style={{ fontSize: 13 }}>No receipt attached</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Claim Status</div>
                <div style={{ marginTop: 4 }}>{getStatusBadge(selectedExpense.status)}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Description</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedExpense.description}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amount</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>₹{selectedExpense.amount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Category</div>
                  <div style={{ fontWeight: 600 }}>{selectedExpense.category}</div>
                </div>
              </div>
              {selectedExpense.staff_name && (
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Requested By</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                     <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{selectedExpense.staff_name.charAt(0)}</div>
                     <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedExpense.staff_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedExpense.staff_id}</div>
                     </div>
                  </div>
                </div>
              )}
              {selectedExpense.reason && (
                <div style={{ borderLeft: '3px solid var(--danger-500)', padding: '4px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rejection Reason</div>
                  <div style={{ fontSize: 13, color: 'var(--danger-400)' }}>{selectedExpense.reason}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 10 }}>
          {activeTab === 'Team Claims' && selectedExpense.status === 'Pending' ? (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
               <button className="btn btn-secondary" style={{ flex: 1, color: 'var(--danger-400)' }} onClick={() => handleAction(selectedExpense.id, 'Rejected')}>
                 <XCircle size={16} style={{ marginRight: 6 }} /> Reject Claim
               </button>
               <button className="btn btn-primary" style={{ flex: 1, background: 'var(--success-600)' }} onClick={() => handleAction(selectedExpense.id, 'Approved')}>
                 <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Approve Claim
               </button>
            </div>
          ) : (
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowDetailModal(false)}>Close Window</button>
          )}
        </div>
      </div>
    </div>
  );
}
