import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Settings } from 'lucide-react';
import leaveService from '../../services/leaveService';
import { useAuth } from '../../context/AuthContext';

import MyLeavesTab from './components/MyLeavesTab';
import AdminApplicationsTab from './components/AdminApplicationsTab';
import AdminSettingsTab from './components/AdminSettingsTab';
import ApplyLeaveModal from './components/ApplyLeaveModal';
import LeaveTypeModal from './components/LeaveTypeModal';
import TeamCoverageAndEarnings from './components/TeamCoverageAndEarnings';

const INITIAL_LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave', quota: 12, color: 'var(--primary-400)' },
  { id: 2, name: 'Sick Leave', quota: 10, color: 'var(--success-400)' },
  { id: 3, name: 'Earned Leave', quota: 18, color: 'var(--warning-400)' },
  { id: 4, name: 'Comp-off', quota: 5, color: 'var(--danger-400)' },
];

export default function LeavesPage() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [myLeaves, setMyLeaves] = useState([]);
  const [globalHistory, setGlobalHistory] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState(INITIAL_LEAVE_TYPES);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [coverage, setCoverage] = useState(null);
  const [earnings, setEarnings] = useState([]);

  const isAdmin = hasRole(['Admin', 'HR', 'Manager', 'Supervisor']);

  const fetchMyLeaves = async () => {
    try {
      const res = await leaveService.getLeaves({ employee_id: user?.id });
      setMyLeaves(res.data);
    } catch (err) { console.error("Failed to fetch my leaves:", err); }
  };

  const fetchBalances = async () => {
    try {
      const res = await leaveService.getLeaveBalances();
      setBalances(res.data);
    } catch (err) { console.error("Failed to fetch balances:", err); }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await leaveService.getLeaveTypes();
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map(t => ({
          id: t.id, name: t.name, quota: t.entitlement,
          color: t.color || INITIAL_LEAVE_TYPES.find(i => i.name === t.name)?.color || 'var(--primary-400)'
        }));
        setLeaveTypes(mapped);
      }
    } catch (err) { console.error("Failed to fetch leave types:", err); }
  };

  const fetchGlobalHistory = async () => {
    if (!isAdmin) return;
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status_filter = filters.status;
      const res = await leaveService.getLeaves(params);
      setGlobalHistory(res.data);
    } catch (err) { console.error("Failed to fetch global history:", err); }
  };

  const fetchCoverage = async () => {
    try {
      const res = await leaveService.getCoverage();
      setCoverage(res.data);
    } catch (err) { console.error("Failed to fetch coverage:", err); }
  };

  const fetchEarnings = async () => {
    try {
      const res = await leaveService.getCompOffEarnings();
      setEarnings(res.data);
    } catch (err) { console.error("Failed to fetch earnings:", err); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchMyLeaves(), fetchBalances(), fetchLeaveTypes(),
        fetchCoverage(), fetchEarnings(),
        isAdmin ? fetchGlobalHistory() : Promise.resolve()
      ]);
      setLoading(false);
    };
    init();
  }, [filters]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      type_id: parseInt(formData.get('type_id')),
      from_date: formData.get('from_date'),
      to_date: formData.get('to_date'),
      reason: formData.get('reason')
    };

    try {
      await leaveService.applyLeave(payload);
      setShowApplyModal(false);
      fetchMyLeaves();
      fetchBalances();
      if (isAdmin) fetchGlobalHistory();
    } catch (err) {
      console.error("Application failed:", err);
      alert(err.response?.data?.detail || "Failed to submit leave request.");
    }
  };

  const handleSaveType = async (payload) => {
    try {
      await leaveService.createLeaveType(payload);
      setShowTypeModal(false);
      fetchLeaveTypes();
    } catch (err) {
      console.error("Failed to save leave type:", err);
      alert("Failed to save leave type. It might already exist.");
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      await leaveService.updateLeaveStatus(leaveId, status);
      fetchGlobalHistory();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update leave status.");
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

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
            <Users size={16} /> Employee Leave History
          </button>
          <button className={`tab-item ${activeTab === 'admin-settings' ? 'active' : ''}`} onClick={() => setActiveTab('admin-settings')}>
            <Settings size={16} /> Leave Settings
          </button>
        </div>
      )}

      {activeTab === 'my-leaves' && <MyLeavesTab balances={balances} myLeaves={myLeaves} />}
      {activeTab === 'admin-applications' && <AdminApplicationsTab filters={filters} setFilters={setFilters} globalHistory={globalHistory} handleUpdateStatus={handleUpdateStatus} />}
      {activeTab === 'admin-settings' && <AdminSettingsTab leaveTypes={leaveTypes} setLeaveTypes={setLeaveTypes} setEditingType={setEditingType} setShowTypeModal={setShowTypeModal} />}

      {isAdmin && activeTab === 'my-leaves' && (
        <TeamCoverageAndEarnings coverage={coverage} earnings={earnings} />
      )}

      {showApplyModal && (
        <ApplyLeaveModal 
          setShowApplyModal={setShowApplyModal} handleApplySubmit={handleApplySubmit} 
          leaveTypes={leaveTypes} balances={balances} 
        />
      )}

      {showTypeModal && (
        <LeaveTypeModal 
          setShowTypeModal={setShowTypeModal} editingType={editingType} handleSaveType={handleSaveType} 
        />
      )}
    </div>
  );
}
