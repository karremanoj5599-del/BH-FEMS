import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import expenseService from '../../services/expenseService';
import { useAuth } from '../../context/AuthContext';

import ExpenseList from './components/ExpenseList';
import ClaimModal from './components/ClaimModal';
import CameraModal from './components/CameraModal';
import ExpenseDetailModal from './components/ExpenseDetailModal';

const CATEGORIES = ['Travel', 'Materials', 'Food', 'Fuel', 'Others'];

export default function ExpensesPage() {
  const { user, isEmployeeView } = useAuth();
  const isAdminOrManager = !isEmployeeView('expenses');

  const [activeTab, setActiveTab] = useState('My Claims'); 
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filter, setFilter] = useState('All');
  
  const [claimItems, setClaimItems] = useState([{
    description: '', category: 'Travel', amount: '', receipt_url: null
  }]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempCapturedImage, setTempCapturedImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = activeTab === 'My Claims' && user ? { employee_id: user.id } : {};
      const res = await expenseService.getExpenses(params);
      const mappedExpenses = res.data.map(exp => ({
        ...exp,
        description: exp.description || exp.type || 'Expense',
        category: exp.category || exp.type || 'Others',
        date: exp.date_incurred,
        staff_name: exp.employee ? exp.employee.name : null,
        staff_id: exp.employee ? exp.employee.employee_id : null,
        receipt: exp.receipt_url
      }));
      setExpenses(mappedExpenses);
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
    const imageData = canvas.toDataURL('image/png');
    setTempCapturedImage(imageData);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const usePhoto = () => {
    if (activeCameraIndex !== null && tempCapturedImage) {
      const updatedItems = [...claimItems];
      updatedItems[activeCameraIndex].receipt_url = tempCapturedImage;
      setClaimItems(updatedItems);
    }
    setTempCapturedImage(null);
    setShowCamera(false);
  };

  const retakePhoto = () => {
    setTempCapturedImage(null);
    startCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setTempCapturedImage(null);
    setShowCamera(false);
  };

  const openDetails = (exp) => {
    setSelectedExpense(exp);
    setShowDetailModal(true);
  };

  const handleAction = async (id, newStatus) => {
    try {
      await expenseService.updateExpenseStatus(id, newStatus);
      fetchData(); 
      setShowDetailModal(false);
    } catch (err) {
      console.error("Failed to update expense status:", err);
      alert("Action failed. Please try again.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Experiments & Claims</h1>
          <p>{activeTab === 'My Claims' ? 'Track your field expenses' : 'Manage and approve team reimbursement claims'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setClaimItems([{ description: '', category: 'Travel', amount: '', receipt_url: null }]);
          setShowClaimModal(true);
        }}>
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
        <ExpenseList expenses={expenses} filter={filter} openDetails={openDetails} />
      )}

      {showClaimModal && (
        <ClaimModal 
          claimItems={claimItems} setClaimItems={setClaimItems} 
          setShowClaimModal={setShowClaimModal} setIsSubmitting={setIsSubmitting} isSubmitting={isSubmitting} 
          setActiveCameraIndex={setActiveCameraIndex} startCamera={startCamera} fetchData={fetchData} 
        />
      )}

      {showCamera && (
        <CameraModal 
          tempCapturedImage={tempCapturedImage} videoRef={videoRef} closeCamera={closeCamera} 
          capturePhoto={capturePhoto} retakePhoto={retakePhoto} usePhoto={usePhoto} canvasRef={canvasRef} 
        />
      )}

      {showDetailModal && selectedExpense && (
        <ExpenseDetailModal 
          selectedExpense={selectedExpense} setShowDetailModal={setShowDetailModal} 
          activeTab={activeTab} handleAction={handleAction} 
        />
      )}

      <style>{`
        .tab-btn { border: none; background: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { color: var(--primary-400); }
        .tab-btn:hover { color: var(--text-primary); }
        .expense-card { transition: all 0.3s; }
        .expense-card:hover { transform: translateY(-4px); border-color: var(--primary-500); }
        .image-hover-overlay:hover { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
