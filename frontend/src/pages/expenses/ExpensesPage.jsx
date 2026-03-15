import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, Receipt, Search, Filter, CheckCircle2, XCircle, 
  Clock, ChevronRight, Image as ImageIcon, Download, 
  MoreVertical, X, Camera, RotateCcw, ShieldCheck, Users, 
  Eye, CornerDownRight, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Travel', 'Materials', 'Food', 'Fuel', 'Others'];

export default function ExpensesPage() {
  const { isEmployeeView } = useAuth();
  const isAdminOrManager = !isEmployeeView('expenses');

  const [activeTab, setActiveTab] = useState('My Claims'); // or 'Team Claims'
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filter, setFilter] = useState('All');
  
  // Camera State
  const [selfieImage, setSelfieImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses/');
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert('Camera access denied'); setShowCamera(false); }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setSelfieImage(canvas.toDataURL('image/png'));
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const closeCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="badge badge-active"><CheckCircle2 size={12} /> Approved</span>;
      case 'Rejected': return <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-400)' }}><XCircle size={12} /> Rejected</span>;
      default: return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
    }
  };

  const openDetails = (exp) => {
    setSelectedExpense(exp);
    setShowDetailModal(true);
  };

  const handleAction = async (id, newStatus) => {
    try {
      await api.patch(`/expenses/${id}`, { status: newStatus });
      fetchData(); // Refresh list
      setShowDetailModal(false);
    } catch (err) {
      console.error("Failed to update expense status:", err);
      alert("Action failed. Please try again.");
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filter === 'All' || expense.category === filter;
    return matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Experiments & Claims</h1>
          <p>{activeTab === 'My Claims' ? 'Track your field expenses' : 'Manage and approve team reimbursement claims'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowClaimModal(true)}>
          <Plus size={16} /> New Claim
        </button>
      </div>

      <div className="tab-container" style={{ marginBottom: 24, display: 'flex', gap: 12, borderBottom: '1px solid var(--border-subtle)' }}>
        <button 
          className={`tab-btn ${activeTab === 'My Claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('My Claims')}
          style={{ padding: '12px 20px', borderBottom: activeTab === 'My Claims' ? '2px solid var(--primary-400)' : 'none', fontWeight: 600 }}
        >
          My Claims
        </button>
        {isAdminOrManager && (
          <button 
            className={`tab-btn ${activeTab === 'Team Claims' ? 'active' : ''}`}
            onClick={() => setActiveTab('Team Claims')}
            style={{ padding: '12px 20px', borderBottom: activeTab === 'Team Claims' ? '2px solid var(--primary-400)' : 'none', fontWeight: 600 }}
          >
            Team Claims <span className="badge badge-pending" style={{ marginLeft: 8 }}>{expenses.filter(e=>e.status==='Pending').length}</span>
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="search-input" style={{ paddingLeft: 36, width: '100%' }} placeholder="Search claims..." />
          </div>
          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="expense-grid">
          {filteredExpenses.map(expense => (
            <div key={expense.id} className="card expense-card animate-slide-up" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 12, 
                    background: 'var(--surface-2)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    color: 'var(--primary-400)' 
                  }}>
                    <Receipt size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{expense.description}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {activeTab === 'Team Claims' && expense.staff_name ? <strong>{expense.staff_name} • </strong> : ''}
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openDetails(expense)}><Eye size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>₹{expense.amount}</span>
                {getStatusBadge(expense.status)}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                 <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openDetails(expense)}>View Details</button>
                 {expense.receipt && <button className="btn btn-ghost btn-sm" title="Download"><Download size={14} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLAIM MODAL */}
      {showClaimModal && (
        <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>New Expense Claim</h2>
              <button className="btn btn-ghost" onClick={() => setShowClaimModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Description *</label>
                <input type="text" className="form-input" placeholder="e.g. Travel to client site" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="0.00" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attach Receipt</label>
                {!selfieImage ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ 
                      flex: 1, border: '2px dashed var(--border-subtle)', 
                      padding: 20, borderRadius: 12, textAlign: 'center', cursor: 'pointer'
                    }}>
                      <ImageIcon size={20} style={{ opacity: 0.5, mb: 4 }} />
                      <div style={{ fontSize: 12 }}>Upload File</div>
                    </div>
                    <div 
                      onClick={startCamera}
                      style={{ 
                        flex: 1, border: '2px dashed var(--primary-500)', 
                        padding: 20, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                        background: 'rgba(99, 102, 241, 0.05)'
                      }}
                    >
                      <Camera size={20} style={{ color: 'var(--primary-400)', mb: 4 }} />
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Click Photo</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <img src={selfieImage} style={{ width: '100%', borderRadius: 12 }} alt="receipt" />
                    <button className="btn btn-ghost" onClick={() => setSelfieImage(null)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}>
                      <X size={14} color="white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowClaimModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowClaimModal(false)}>Submit Claim</button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
      {showCamera && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal" style={{ maxWidth: 400, padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3' }}>
              {!selfieImage ? (
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={selfieImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="captured" />
              )}
              <button className="btn btn-ghost" onClick={closeCamera} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)' }}>
                <X color="white" />
              </button>
            </div>
            <div style={{ padding: 20, textAlign: 'center' }}>
              {!selfieImage ? (
                <button className="btn btn-primary" onClick={capturePhoto} style={{ width: 64, height: 64, borderRadius: '50%', padding: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid white' }} />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-secondary" onClick={() => setSelfieImage(null)} style={{ flex: 1 }}>Retake</button>
                  <button className="btn btn-primary" onClick={() => setShowCamera(false)} style={{ flex: 1 }}>Use Photo</button>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailModal && selectedExpense && (
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
                          <div style={{ textAlign: 'center', opacity: 0.6 }}>
                            <ImageIcon size={48} style={{ mb: 10 }} />
                            <p style={{ fontSize: 13 }}>Click to view high-res image</p>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <AlertTriangle size={32} style={{ mb: 10 }} />
                            <p style={{ fontSize: 13 }}>No receipt attached</p>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Claim Status</div>
                    <div style={{ mt: 4 }}>{getStatusBadge(selectedExpense.status)}</div>
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
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', mb: 4 }}>Requested By</div>
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
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', mt: 10 }}>
              {activeTab === 'Team Claims' && selectedExpense.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                   <button className="btn btn-secondary" style={{ flex: 1, color: 'var(--danger-400)' }} onClick={() => handleAction(selectedExpense.id, 'Rejected')}>
                     <XCircle size={16} style={{ mr: 6 }} /> Reject Claim
                   </button>
                   <button className="btn btn-primary" style={{ flex: 1, background: 'var(--success-600)' }} onClick={() => handleAction(selectedExpense.id, 'Approved')}>
                     <CheckCircle2 size={16} style={{ mr: 6 }} /> Approve Claim
                   </button>
                </div>
              ) : (
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowDetailModal(false)}>Close Window</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-btn { border: none; background: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { color: var(--primary-400); }
        .tab-btn:hover { color: var(--text-primary); }
        .expense-card { transition: all 0.3s; }
        .expense-card:hover { transform: translateY(-4px); border-color: var(--primary-500); }
      `}</style>
    </div>
  );
}
