import React from 'react';
import { Timer, Edit2, Trash2 } from 'lucide-react';

const format24h = (timeStr) => {
  if (!timeStr) return '-';
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return timeStr;
};

export default function ShiftTypesTab({ shiftTypes, onEdit, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
      {shiftTypes.map(type => (
        <div key={type.id} className="card shift-type-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                <Timer size={20} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{type.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(type)}><Edit2 size={14} /></button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => onDelete(type.id)}><Trash2 size={14} /></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="card" style={{ background: 'var(--surface-2)', padding: 12, border: 'none' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Timing</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{format24h(type.start_time)} - {format24h(type.end_time)}</div>
            </div>
            <div className="card" style={{ background: 'var(--surface-2)', padding: 12, border: 'none' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Grace / Break</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{type.grace_period}m / {type.break_rules}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>OT Policy:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-400)' }}>{type.ot_policy || 'none'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Auto Shift:</span>
              <span style={{ fontWeight: 600, color: type.is_auto_shift ? 'var(--success-400)' : 'var(--text-muted)' }}>
                {type.is_auto_shift ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Linked Policy:</span>
              <span style={{ fontWeight: 600, color: type.policy ? 'var(--primary-400)' : 'var(--text-muted)' }}>
                {type.policy ? type.policy.name : 'None'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
