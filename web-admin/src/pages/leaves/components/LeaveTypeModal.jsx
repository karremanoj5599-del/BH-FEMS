import React, { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = [
  { label: 'Primary', value: '#6366f1' },
  { label: 'Success', value: '#22c55e' },
  { label: 'Warning', value: '#f59e0b' },
  { label: 'Danger', value: '#ef4444' },
  { label: 'Info', value: '#06b6d4' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Orange', value: '#f97316' },
];

export default function LeaveTypeModal({ 
  setShowTypeModal, editingType, handleSaveType 
}) {
  const [name, setName] = useState(editingType?.name || '');
  const [quota, setQuota] = useState(editingType?.quota || 0);
  const [color, setColor] = useState(editingType?.color || '#6366f1');

  const onSave = () => {
    handleSaveType({ name, entitlement: parseInt(quota, 10), color });
  };

  return (
    <div className="modal-overlay" onClick={() => setShowTypeModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2>{editingType ? 'Edit Leave Type' : 'Add Leave Type'}</h2>
          <button className="btn btn-ghost" onClick={() => setShowTypeModal(false)}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Type Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Annual Quota (Days)</label>
            <input type="number" className="form-input" value={quota} onChange={e => setQuota(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Theme Color</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {COLORS.map(c => (
                <div 
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: c.value, cursor: 'pointer',
                    border: color === c.value ? '2px solid var(--text-main)' : '2px solid transparent',
                    boxShadow: color === c.value ? '0 0 0 2px var(--surface-1)' : 'none',
                    transition: 'all 0.2s ease',
                    opacity: color === c.value ? 1 : 0.7
                  }}
                  title={c.label}
                />
              ))}
              <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 4px' }} />
              <div style={{ position: 'relative', width: 32, height: 32 }}>
                <input 
                  type="color" 
                  value={color.startsWith('var') ? '#6366f1' : color} 
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer',
                    appearance: 'none', background: 'none'
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: 100, fontSize: 12, height: 32 }} 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Custom Hex Code</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
