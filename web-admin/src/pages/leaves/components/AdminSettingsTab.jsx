import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminSettingsTab({ leaveTypes, setLeaveTypes, setEditingType, setShowTypeModal }) {
  return (
    <div className="animate-fade-in">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Leave Types & Quotas</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configure annual leave credits per category</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingType(null); setShowTypeModal(true); }}>
            <Plus size={14} /> Add Type
          </button>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type Name</th>
                <th>Annual Quota (Days)</th>
                <th>Color Tag</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map(type => (
                <tr key={type.id}>
                  <td><span style={{ fontWeight: 600 }}>{type.name}</span></td>
                  <td>{type.quota} Days/Year</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: type.color }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{type.color}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditingType(type); setShowTypeModal(true); }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setLeaveTypes(prev => prev.filter(t => t.id !== type.id))}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
