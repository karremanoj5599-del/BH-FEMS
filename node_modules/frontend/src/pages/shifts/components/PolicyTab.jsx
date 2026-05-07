import React from 'react';
import { FileCheck, Shield, Edit2, Trash2 } from 'lucide-react';

const OT_FORMULA_LABELS = {
  not_applicable: 'Not Applicable',
  shift_end_last_punch: 'Shift End → Last Punch',
  shift_hours_total: 'Shift Hours → Total Duration',
  early_late_punch: 'Early Punch → Late Punch',
};

export default function PolicyTab({ policies, onEditPolicy, onDeletePolicy }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileCheck size={22} color="var(--primary-400)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Policy & Compliance Overview</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>OT rules, night allowances, auto-shift flags and week-off patterns for all shift types.</div>
        </div>
      </div>

      {policies.map(policy => (
        <div key={policy.id} className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="var(--success-400)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{policy.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Standalone Compliance Rule</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onEditPolicy(policy)}>
                <Edit2 size={13} /> Edit
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => onDeletePolicy(policy.id)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Auto Shift</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: policy.is_auto_shift ? 'var(--success-400)' : 'var(--text-secondary)' }}>
                {policy.is_auto_shift ? '✓ Enabled' : '✗ Disabled'}
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Night Allowance</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: policy.night_allowance_enabled ? 'var(--warning-400)' : 'var(--text-secondary)' }}>
                {policy.night_allowance_enabled ? '🌙 Enabled' : '— Disabled'}
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>OT Formula</div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>
                {OT_FORMULA_LABELS[policy.ot_formula] || 'Not Applicable'}
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>OT Approver</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent-400)' }}>
                {policy.ot_approval_role || 'Manager'}
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Week Off 1</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {policy.week_off_1_day || '— Not set'}
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Week Off 2</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {policy.week_off_2_day && policy.week_off_2_week
                  ? `${policy.week_off_2_week} ${policy.week_off_2_day}`
                  : policy.week_off_2_day || '— Not set'
                }
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 8, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '100%', marginBottom: -8 }}>Visual Highlighting</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: policy.highlight_late_check_in ? 'var(--danger-400)' : 'var(--surface-3)' }}></div>
                <span style={{ color: policy.highlight_late_check_in ? 'var(--text-primary)' : 'var(--text-muted)' }}>Late Check-in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: policy.highlight_early_check_out ? 'var(--warning-400)' : 'var(--surface-3)' }}></div>
                <span style={{ color: policy.highlight_early_check_out ? 'var(--text-primary)' : 'var(--text-muted)' }}>Early Check-out</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: policy.highlight_ot ? 'var(--primary-400)' : 'var(--surface-3)' }}></div>
                <span style={{ color: policy.highlight_ot ? 'var(--text-primary)' : 'var(--text-muted)' }}>Overtime</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: policy.highlight_week_off ? 'var(--success-400)' : 'var(--surface-3)' }}></div>
                <span style={{ color: policy.highlight_week_off ? 'var(--text-primary)' : 'var(--text-muted)' }}>Week Offs</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
