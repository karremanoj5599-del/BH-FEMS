import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, Plus, Calendar, RefreshCw, ChevronRight, 
  Settings, Users, AlertCircle, CheckCircle, 
  Star, ArrowRightLeft, Shield, Timer, X, Edit2
} from 'lucide-react';

export default function ShiftsPage() {
  const { user, isEmployeeView } = useAuth();
  const isEmployee = isEmployeeView('shifts');

  const [activeTab, setActiveTab] = useState(isEmployee ? 'schedule' : 'types');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('type');

  // Interactive State Data
  const [shiftTypes, setShiftTypes] = useState([
    { id: 1, name: 'Morning Shift', start: '06:00', end: '14:00', grace: 15, break: '45m', ot: 'Approved Only', status: 'Active' },
    { id: 2, name: 'General Shift', start: '09:00', end: '18:00', grace: 30, break: '60m', ot: 'Double on Holidays', status: 'Active' },
    { id: 3, name: 'Night Shift', start: '22:00', end: '06:00', grace: 15, break: '30m', ot: 'Auto-Approved', status: 'Active' },
  ]);

  const [swaps, setSwaps] = useState([
    { id: 1, requester: 'Rajesh Kumar', partner: 'Priya Sharma', date: '2026-03-15', reason: 'Personal Emergency', status: 'Pending' },
  ]);

  const [bids, setBids] = useState([
    { id: 1, type: 'Night Shift', employee: 'Amit Singh', points: 120, priority: 1, status: 'Confirmed' },
    { id: 2, type: 'Night Shift', employee: 'Suresh Raina', points: 85, priority: 2, status: 'Pending' },
  ]);

  const [schedule, setSchedule] = useState([
    { employee: 'Rajesh Kumar', shifts: ['Morning', 'Morning', 'General', 'General', 'Off', 'Night', 'Night'] },
    { employee: 'Priya Sharma', shifts: ['General', 'General', 'Off', 'Morning', 'Morning', 'General', 'General'] },
    { employee: 'Amit Singh', shifts: ['Night', 'Night', 'Night', 'Night', 'Night', 'Off', 'Off'] },
  ]);

  // Derived filtered data for employees
  const displaySchedule = isEmployee ? schedule.filter(s => s.employee === user?.name) : schedule;
  const displaySwaps = isEmployee ? swaps.filter(s => s.requester === user?.name || s.partner === user?.name) : swaps;
  const displayBids = isEmployee ? bids.filter(b => b.employee === user?.name) : bids;

  const tabs = [
    { id: 'types', label: 'Shift Types', icon: Settings, hideForEmployee: true },
    { id: 'schedule', label: isEmployee ? 'My Schedule' : 'Roster / Schedule', icon: Calendar },
    { id: 'swaps', label: isEmployee ? 'My Swap Requests' : 'Swap Requests', icon: ArrowRightLeft },
    { id: 'bidding', label: 'Shift Bidding', icon: Star },
  ].filter(tab => !(isEmployee && tab.hideForEmployee));

  const getHeaderAction = () => {
    switch (activeTab) {
      case 'types': return { label: 'Create Shift Type', type: 'type' };
      case 'schedule': return { label: 'Assign Shift', type: 'assignment' };
      case 'swaps': return { label: 'Request Swap', type: 'swap' };
      case 'bidding': return { label: 'Place Bid', type: 'bid' };
      default: return null;
    }
  };

  const action = getHeaderAction();

  const handleActionClick = () => {
    setModalType(action.type);
    setShowModal(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (modalType === 'type') {
      const newType = {
        id: Date.now(),
        name: formData.get('name'),
        start: formData.get('start'),
        end: formData.get('end'),
        grace: formData.get('grace'),
        break: formData.get('break') + 'm',
        ot: formData.get('otPolicy'),
        status: 'Active'
      };
      setShiftTypes([...shiftTypes, newType]);
    } else if (modalType === 'assignment') {
      // Simplistic mock update
      const empName = formData.get('employee');
      const sType = formData.get('shiftType');
      setSchedule(prev => prev.map(s => s.employee === empName ? { ...s, shifts: s.shifts.map((sh, i) => i === 0 ? sType : sh) } : s));
    } else if (modalType === 'swap') {
      const newSwap = {
        id: Date.now(),
        requester: 'Current User', // Mocked user
        partner: formData.get('partner'),
        date: formData.get('date'),
        reason: formData.get('reason'),
        status: 'Pending'
      };
      setSwaps([...swaps, newSwap]);
    } else if (modalType === 'bid') {
      const newBid = {
        id: Date.now(),
        type: formData.get('shiftType'),
        employee: 'Current User',
        points: parseInt(formData.get('points') || 0),
        priority: bids.length + 1,
        status: 'Pending'
      };
      setBids([...bids, newBid]);
    }

    setShowModal(false);
  };

  const handleSwapAction = (id, newStatus) => {
    setSwaps(swaps.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Shifts & Workforce Scheduling</h1>
          <p>Define policies, manage rotational rosters, and handle employee shift preferences.</p>
        </div>
        {action && (
          <button className="btn btn-primary" onClick={handleActionClick}>
            <Plus size={16} /> {action.label}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 1 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            style={{ 
              borderRadius: '12px 12px 0 0', 
              padding: '12px 20px',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary-400)' : '3px solid transparent'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'types' && (
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
                <button className="btn btn-ghost btn-sm"><Edit2 size={14} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="card" style={{ background: 'var(--surface-2)', padding: 12, border: 'none' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Timing</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{type.start} - {type.end}</div>
                </div>
                <div className="card" style={{ background: 'var(--surface-2)', padding: 12, border: 'none' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Grace / Break</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{type.grace}m / {type.break}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>OT Policy:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-400)' }}>{type.ot}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Auto Detection:</span>
                  <span style={{ fontWeight: 600, color: 'var(--success-400)' }}>Enabled</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Weekly Roster (March 15 - March 21)</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm">Previous</button>
              <button className="btn btn-secondary btn-sm">Today</button>
              <button className="btn btn-ghost btn-sm">Next</button>
            </div>
          </div>
          <div className="data-table-wrapper">
             <table className="data-table">
               <thead>
                 <tr>
                   <th>Employee</th>
                   <th>Mon 15</th>
                   <th>Tue 16</th>
                   <th>Wed 17</th>
                   <th>Thu 18</th>
                   <th>Fri 19</th>
                   <th>Sat 20</th>
                   <th>Sun 21</th>
                 </tr>
               </thead>
               <tbody>
                 {displaySchedule.map(row => (
                   <tr key={row.employee}>
                     <td style={{ fontWeight: 600 }}>{row.employee}</td>
                     {row.shifts.map((shift, idx) => (
                       <td key={idx}>
                         <span className={`badge ${shift === 'Off' ? 'badge-danger' : shift === 'Morning' ? 'badge-active' : shift === 'Night' ? '' : 'badge-pending'}`}>
                           {shift}
                         </span>
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'swaps' && (
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
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displaySwaps.map(swap => (
                  <tr key={swap.id}>
                    <td>#SWP-{swap.id}</td>
                    <td style={{ fontWeight: 600 }}>{swap.requester}</td>
                    <td style={{ fontWeight: 600 }}>{swap.partner}</td>
                    <td>{swap.date}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{swap.reason}</td>
                    <td>
                      <span className={`badge ${swap.status === 'Approved' ? 'badge-active' : swap.status === 'Rejected' ? 'badge-danger' : 'badge-pending'}`}>
                        {swap.status}
                      </span>
                    </td>
                    <td>
                      {!isEmployee && swap.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleSwapAction(swap.id, 'Approved')}>Approve</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleSwapAction(swap.id, 'Rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bidding' && (
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
      )}

      {/* Dynamic Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{action?.label}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className="modal-body">
                {modalType === 'type' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Shift Name</label>
                      <input name="name" type="text" className="form-input" placeholder="e.g. Night Shift B" required />
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Start Time</label>
                        <input name="start" type="time" className="form-input" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Time</label>
                        <input name="end" type="time" className="form-input" required />
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Grace Period (minutes)</label>
                        <input name="grace" type="number" className="form-input" placeholder="15" defaultValue={15} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Break Duration (minutes)</label>
                        <input name="break" type="number" className="form-input" placeholder="45" defaultValue={45} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">OT (Overtime) Policy</label>
                      <select name="otPolicy" className="form-select">
                        <option value="none">No Overtime Allowed</option>
                        <option value="Approved Only">Approved Only (Manager Approval Required)</option>
                        <option value="Auto-Approved">Auto-Approved (Logged Automatically)</option>
                        <option value="Double on Holidays">Double Pay on Holidays</option>
                      </select>
                    </div>

                    <div className="card" style={{ background: 'var(--surface-3)', marginTop: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Policy & Compliance</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" defaultChecked /> Auto-late detection
                        </label>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" defaultChecked /> Night Shift Allowance
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'assignment' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Employee</label>
                      <select name="employee" className="form-select" required>
                        <option value="Rajesh Kumar">Rajesh Kumar</option>
                        <option value="Priya Sharma">Priya Sharma</option>
                        <option value="Amit Singh">Amit Singh</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shift Type</label>
                      <select name="shiftType" className="form-select" required>
                        {shiftTypes.map(s => <option key={s.id} value={s.name.split(' ')[0]}>{s.name}</option>)}
                      </select>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>* Note: This simplifies assigning the target employee to the selected shift for Monday in the demo.</p>
                  </>
                )}

                {modalType === 'swap' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Target Date</label>
                      <input name="date" type="date" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Colleague to Swap With</label>
                      <select name="partner" className="form-select" required>
                        <option value="Amit Singh">Amit Singh</option>
                        <option value="Priya Sharma">Priya Sharma</option>
                        <option value="Arun Varma">Arun Varma</option>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .shift-type-card { border-left: 4px solid var(--primary-500); }
        .nav-item { cursor: pointer; transition: all 0.2s; }
        .nav-item:hover { background: var(--surface-2); }
        .nav-item.active { color: var(--primary-400); }
      `}</style>
    </div>
  );
}
