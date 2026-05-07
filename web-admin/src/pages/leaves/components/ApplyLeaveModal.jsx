import React from 'react';
import { X } from 'lucide-react';

export default function ApplyLeaveModal({ setShowApplyModal, handleApplySubmit, leaveTypes, balances }) {
  return (
    <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2>Request Time Off</h2>
          <button className="btn btn-ghost" onClick={() => setShowApplyModal(false)}><X size={18} /></button>
        </div>
        <form onSubmit={handleApplySubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select name="type_id" className="form-select" required>
                <option value="">Select Leave Type</option>
                {leaveTypes.map(t => {
                  const balance = balances.find(b => b.type_id === t.id);
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} {balance ? `(${balance.remaining} days left)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input name="from_date" type="date" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input name="to_date" type="date" className="form-input" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea name="reason" className="form-input" rows="3" required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
