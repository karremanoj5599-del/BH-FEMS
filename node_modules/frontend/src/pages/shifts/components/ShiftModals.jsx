import React from 'react';
import { X, Shield, FileCheck } from 'lucide-react';

export default function ShiftModals({ 
  modalType, 
  onClose, 
  onSubmit, 
  editingType, 
  editingPolicy, 
  actionLabel, 
  policies, 
  employees, 
  shiftTypes, 
  rawShifts, 
  user 
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingPolicy ? `Edit Policy: ${editingPolicy.name}` : editingType ? `Edit Shift Type: ${editingType.name}` : actionLabel}</h2>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {modalType === 'type' && (
              <>
                <div className="form-group">
                  <label className="form-label">Shift Name</label>
                  <input name="name" type="text" className="form-input" placeholder="e.g. Night Shift B" defaultValue={editingType?.name} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input name="start" type="time" className="form-input" defaultValue={editingType?.start_time} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input name="end" type="time" className="form-input" defaultValue={editingType?.end_time} required />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Grace Period (minutes)</label>
                    <input name="grace" type="number" className="form-input" placeholder="15" defaultValue={editingType?.grace_period ?? 15} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Break Duration (minutes)</label>
                    <input name="break" type="number" className="form-input" placeholder="45" defaultValue={editingType?.break_rules ? parseInt(editingType.break_rules) : 45} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">OT (Overtime) Policy</label>
                  <select name="otPolicy" className="form-select" defaultValue={editingType?.ot_policy || 'none'}>
                    <option value="none">No Overtime Allowed</option>
                    <option value="Approved Only">Approved Only (Manager Approval Required)</option>
                    <option value="Auto-Approved">Auto-Approved (Logged Automatically)</option>
                    <option value="Double on Holidays">Double Pay on Holidays</option>
                  </select>
                </div>

                <div className="card" style={{ background: 'var(--surface-3)', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-300)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={14} /> Linked Policy & Compliance
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Compliance Policy Set</label>
                    <select name="policy_id" className="form-select" defaultValue={editingType?.policy_id || ''}>
                      <option value="">— No Policy Linked —</option>
                      {policies.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Linking a policy will enforce OT rules, night allowances, and week-offs from that set.
                    </div>
                  </div>
                </div>
              </>
            )}

            {modalType === 'policy' && (
              <>
                <div className="form-group">
                  <label className="form-label">Policy Name</label>
                  <input name="name" type="text" className="form-input" placeholder="e.g. Standard Corporate Policy" defaultValue={editingPolicy?.name} required />
                </div>

                <div className="card" style={{ background: 'var(--surface-3)', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-300)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileCheck size={14} /> Policy Rules
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Auto Shift</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Flexible attendance — no fixed timings enforced</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input name="is_auto_shift" type="checkbox" defaultChecked={editingPolicy?.is_auto_shift} style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 12 }}>Enable</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>🌙 Night Allowance</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Grant night shift pay allowance</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input name="night_allowance_enabled" type="checkbox" defaultChecked={editingPolicy?.night_allowance_enabled} style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 12 }}>Enable</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>OT Calculation Formula</label>
                    <select name="ot_formula" className="form-select" defaultValue={editingPolicy?.ot_formula || 'not_applicable'}>
                      <option value="not_applicable">Not Applicable</option>
                      <option value="shift_end_last_punch">Shift End Time → Last Punch</option>
                      <option value="shift_hours_total">Shift Hours → Total Duration</option>
                      <option value="early_late_punch">Early Coming Punch → Late Going Punch</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>OT Approval Role</label>
                    <select name="ot_approval_role" className="form-select" defaultValue={editingPolicy?.ot_approval_role || 'Manager'}>
                      <option value="Manager">Manager (Direct Manager Approves)</option>
                      <option value="HR">HR Department</option>
                      <option value="Admin">Admin Only</option>
                      <option value="Self">Self (Auto-Approved)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Week Off Rules</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Week Off 1 (Fixed Day)</label>
                        <select name="week_off_1_day" className="form-select" defaultValue={editingPolicy?.week_off_1_day || ''}>
                          <option value="">— None —</option>
                          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Week Off 2 (Day)</label>
                          <select name="week_off_2_day" className="form-select" defaultValue={editingPolicy?.week_off_2_day || ''}>
                            <option value="">— None —</option>
                            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Which Week</label>
                          <select name="week_off_2_week" className="form-select" defaultValue={editingPolicy?.week_off_2_week || ''}>
                            <option value="">— None —</option>
                            {['1st','2nd','3rd','4th','Last'].map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Visual Highlights</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: 12 }}>Late Check-in</span>
                        <input name="highlight_late_check_in" type="checkbox" defaultChecked={editingPolicy?.highlight_late_check_in} style={{ width: 14, height: 14 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: 12 }}>Early Check-out</span>
                        <input name="highlight_early_check_out" type="checkbox" defaultChecked={editingPolicy?.highlight_early_check_out} style={{ width: 14, height: 14 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: 12 }}>Overtime (OT)</span>
                        <input name="highlight_ot" type="checkbox" defaultChecked={editingPolicy?.highlight_ot} style={{ width: 14, height: 14 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: 12 }}>Week Offs</span>
                        <input name="highlight_week_off" type="checkbox" defaultChecked={editingPolicy?.highlight_week_off} style={{ width: 14, height: 14 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {modalType === 'assignment' && (
              <>
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select name="employee_id" className="form-select" required>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Shift Type</label>
                  <select name="shift_type_id" className="form-select" required>
                    <option value="">Select Shift Type...</option>
                    {shiftTypes.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.start_time}-{s.end_time})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Shift Date</label>
                  <input name="date" type="date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>* Assign a specific shift type to an employee for a chosen date.</p>
              </>
            )}

            {modalType === 'swap' && (
              <>
                <div className="form-group">
                  <label className="form-label">Shift to Swap</label>
                  <select name="shift_id" className="form-select" required>
                    <option value="">Select your shift...</option>
                    {rawShifts.filter(sh => sh.employee_id === user?.id).map(sh => {
                      const type = shiftTypes.find(t => t.id === sh.shift_type_id);
                      return (
                        <option key={sh.id} value={sh.id}>
                          {sh.shift_date} - {type ? type.name : 'Shift'}
                        </option>
                      );
                    })}
                    {rawShifts.filter(sh => sh.employee_id === user?.id).length === 0 && (
                      <option disabled>No shifts found</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Colleague to Swap With</label>
                  <select name="swap_with_employee" className="form-select" required>
                    <option value="">Select colleague...</option>
                    {employees.filter(e => e.id !== user?.id).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea name="reason" className="form-input" placeholder="Reason for swap request..." required></textarea>
                </div>
              </>
            )}

            {modalType === 'bid' && (
              <>
                <div className="form-group">
                  <label className="form-label">Shift Preference</label>
                  <select name="shiftType" className="form-select" required>
                    {shiftTypes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bid Points to Spend (Available: 200)</label>
                  <input name="points" type="number" className="form-input" placeholder="e.g. 50" min="0" max="200" required />
                </div>
                <div className="alert alert-warning" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: 12, borderRadius: 8, marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--primary-400)' }}>Higher points increase your chance of getting popular shifts during automated assignment.</div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
