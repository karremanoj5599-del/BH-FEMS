import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Plus, Search, Filter, 
  CheckCircle2, XCircle, Clock, ChevronRight, 
  Info, AlertCircle, X, ArrowUpRight, Settings,
  Check, Trash2, Edit2, Users
} from 'lucide-react';
import api from '../../services/api';

const INITIAL_LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave', quota: 12, color: 'var(--primary-400)' },
  { id: 2, name: 'Sick Leave', quota: 10, color: 'var(--success-400)' },
  { id: 3, name: 'Earned Leave', quota: 18, color: 'var(--warning-400)' },
  { id: 4, name: 'Comp-off', quota: 5, color: 'var(--danger-400)' },
];

export default function LeavesPage() {
  const { user, isEmployeeView } = useAuth();
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState(INITIAL_LEAVE_TYPES);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const isAdmin = !isEmployeeView('leaves');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/leaves/');
        setLeaves(res.data);
      } catch (err) {
        console.error("Failed to fetch leaves:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="badge badge-active"><CheckCircle2 size={12} /> Approved</span>;
      case 'Rejected': return <span className="badge badge-danger"><XCircle size={12} /> Rejected</span>;
      default: return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
    }
  };

  const handleUpdateStatus = (id, status) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const renderMyLeaves = () => (
    <div className="animate-fade-in">
      <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {leaveTypes.map(type => (
          <div key={type.name} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: type.color }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{type.name}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700 }}>{type.quota - 2}</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {type.quota} days available</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.filter(l => isAdmin || l.employee === user?.name).map(leave => (
                <tr key={leave.id}>
                  <td><span style={{ fontWeight: 600 }}>{leave.type}</span></td>
                  <td>{leave.startDate} to {leave.endDate}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td><button className="btn btn-ghost btn-sm"><ArrowUpRight size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdminApplications = () => (
    <div className="animate-fade-in">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Global Leave Applications</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" className="search-input" placeholder="Search employee..." style={{ width: 200 }} />
            <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id}>
                  <td><span style={{ fontWeight: 600 }}>{leave.employee}</span></td>
                  <td>{leave.type}</td>
                  <td>{leave.startDate} to {leave.endDate}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    {leave.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success-400)' }} onClick={() => handleUpdateStatus(leave.id, 'Approved')}>
                          <Check size={16} />
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleUpdateStatus(leave.id, 'Rejected')}>
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdminSettings = () => (
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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Leave Management</h1>
          <p>Request time off and manage team availability</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {isAdmin && (
        <div className="tabs-container" style={{ marginBottom: 24 }}>
          <button className={`tab-item ${activeTab === 'my-leaves' ? 'active' : ''}`} onClick={() => setActiveTab('my-leaves')}>
            <Calendar size={16} /> My Leaves
          </button>
          <button className={`tab-item ${activeTab === 'admin-applications' ? 'active' : ''}`} onClick={() => setActiveTab('admin-applications')}>
            <Users size={16} /> Global Applications
          </button>
          <button className={`tab-item ${activeTab === 'admin-settings' ? 'active' : ''}`} onClick={() => setActiveTab('admin-settings')}>
            <Settings size={16} /> Leave Settings
          </button>
        </div>
      )}

      {activeTab === 'my-leaves' && renderMyLeaves()}
      {activeTab === 'admin-applications' && renderAdminApplications()}
      {activeTab === 'admin-settings' && renderAdminSettings()}

      {/* RENDER POLICIES & TEAM IMPACT */}
      {activeTab === 'my-leaves' && (
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--primary-400)" /> Team Availability & Coverage
            </h3>
            <div style={{ background: 'var(--surface-3)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13 }}>March 25 - March 26</span>
                <span className="badge badge-pending">3/5 Techs Unavailable</span>
              </div>
              <div className="alert alert-warning" style={{ fontSize: 12, display: 'flex', gap: 8, padding: 10, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
                <AlertCircle size={14} />
                <span>Notice: High leave volume in your team for these dates. Approval may be delayed.</span>
              </div>
            </div>
          </div>
          
          <div className="card">
             <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
               <ArrowUpRight size={18} color="var(--accent-400)" /> Comp-off Earnings
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                 <span>Worked: Sunday, March 8</span>
                 <span style={{ color: 'var(--success-400)' }}>+1.0 Day</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                 <span>Worked: Holi Holiday</span>
                 <span style={{ color: 'var(--success-400)' }}>+1.0 Day</span>
               </div>
               <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                 *Auto-credited for working on designated off-days.
               </p>
             </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Request Time Off</h2>
              <button className="btn btn-ghost" onClick={() => setShowApplyModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-select">
                  {leaveTypes.map(t => <option key={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" /></div>
                <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" /></div>
              </div>
              <div className="form-group"><label className="form-label">Reason</label><textarea className="form-input" rows="3" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowApplyModal(false)}>Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showTypeModal && (
        <div className="modal-overlay" onClick={() => setShowTypeModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2>{editingType ? 'Edit Leave Type' : 'Add Leave Type'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowTypeModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Type Name</label>
                <input type="text" className="form-input" defaultValue={editingType?.name} />
              </div>
              <div className="form-group">
                <label className="form-label">Annual Quota (Days)</label>
                <input type="number" className="form-input" defaultValue={editingType?.quota} />
              </div>
              <div className="form-group">
                <label className="form-label">Theme Color (CSS Variable)</label>
                <input type="text" className="form-input" defaultValue={editingType?.color || 'var(--primary-400)'} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowTypeModal(false)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
