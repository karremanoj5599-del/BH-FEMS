import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import shiftService from '../../services/shiftService';
import employeeService from '../../services/employeeService';
import { Plus, Calendar, Settings, Star, ArrowRightLeft, FileCheck } from 'lucide-react';
import api from '../../services/api';

import ShiftTypesTab from './components/ShiftTypesTab';
import ScheduleTab from './components/ScheduleTab';
import SwapsTab from './components/SwapsTab';
import PolicyTab from './components/PolicyTab';
import BiddingTab from './components/BiddingTab';
import ShiftModals from './components/ShiftModals';

export default function ShiftsPage() {
  const { user, isEmployeeView } = useAuth();
  const isEmployee = isEmployeeView('shifts');

  const [activeTab, setActiveTab] = useState(isEmployee ? 'schedule' : 'types');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('type');
  const [loading, setLoading] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [editingPolicy, setEditingPolicy] = useState(null);

  // Live State Data
  const [shiftTypes, setShiftTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [rawShifts, setRawShifts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [bids, setBids] = useState([
    { id: 1, type: 'Night Shift', employee: 'Amit Singh', points: 120, priority: 1, status: 'Confirmed' },
    { id: 2, type: 'Night Shift', employee: 'Suresh Raina', points: 85, priority: 2, status: 'Pending' },
  ]);
  const [selectedBid, setSelectedBid] = useState(null);

  // Week Navigation State
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));

  const fetchData = async () => {
    setLoading(true);
    try {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Parallel but resilient fetching
      const [typesRes, empRes, shiftsRes, swapsRes, policiesRes] = await Promise.allSettled([
        shiftService.getShiftTypes(),
        employeeService.getEmployees({ page_size: 100 }),
        shiftService.getShifts({ 
          start_date: currentWeekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0]
        }),
        api.get('/shifts/swap-requests'),
        shiftService.getPolicies()
      ]);

      const typesData = typesRes.status === 'fulfilled' ? typesRes.value.data : [];
      const employeesData = empRes.status === 'fulfilled' ? (empRes.value.data.items || []) : [];
      const rawShiftsData = shiftsRes.status === 'fulfilled' ? (shiftsRes.value.data || []) : [];
      const policiesData = policiesRes.status === 'fulfilled' ? (policiesRes.value.data || []) : [];
      setPolicies(policiesData);
      const rawSwaps = swapsRes.status === 'fulfilled' ? (swapsRes.value.data || []) : [];

      setShiftTypes(typesData);
      setEmployees(employeesData);
      setRawShifts(rawShiftsData);
      
      // Transform backend swaps
      const formattedSwaps = rawSwaps.map(s => {
        const req = employeesData.find(e => e.id === s.requested_by);
        const part = employeesData.find(e => e.id === s.swap_with_employee);
        const shift = rawShiftsData.find(sh => sh.id === s.shift_id);
        const approver = employeesData.find(e => e.id === s.approved_by);
        
        return {
          id: s.id,
          requester: req ? req.name : `ID: ${s.requested_by}`,
          requester_obj: req, // Store object for permission check
          partner: part ? part.name : `ID: ${s.swap_with_employee}`,
          date: shift ? shift.shift_date : 'N/A',
          reason: s.reason,
          status: s.status,
          approver_name: approver ? approver.name : (s.approved_by ? `ID: ${s.approved_by}` : ''),
          processed_at: s.updated_at ? new Date(s.updated_at).toLocaleString() : ''
        };
      });
      setSwaps(formattedSwaps);

      // Transform backend shifts into schedule rows
      const empMap = {};
      
      // Initialize with all fetched employees
      employeesData.forEach(emp => {
        empMap[emp.id] = { employee: emp.name, shifts: Array(7).fill('Off') };
      });

      // Populate shifts
      rawShiftsData.forEach(s => {
        if (empMap[s.employee_id]) {
          const shiftDate = new Date(s.shift_date);
          const diffTime = Math.abs(shiftDate - currentWeekStart);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7) {
            const type = typesData.find(t => t.id === s.shift_type_id);
            if (type) {
              empMap[s.employee_id].shifts[diffDays] = type.name.split(' ')[0];
            }
          }
        }
      });

      setSchedule(Object.values(empMap));
    } catch (err) {
      console.error("Failed to fetch shift data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  // Navigation Handlers
  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const formatDateRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const options = { month: 'long', day: 'numeric' };
    return `${currentWeekStart.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
  };

  const getWeekDays = () => {
    const days = [];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push({ label: labels[i], date: d.getDate() });
    }
    return days;
  };

  const displaySchedule = isEmployee ? schedule.filter(s => s.employee === user?.name) : schedule;
  const displaySwaps = isEmployee ? swaps.filter(s => s.requester === user?.name || s.partner === user?.name) : swaps;
  const displayBids = isEmployee ? bids.filter(b => b.employee === user?.name) : bids;

  const tabs = [
    { id: 'types', label: 'Shift Types', icon: Settings, hideForEmployee: true },
    { id: 'schedule', label: isEmployee ? 'My Schedule' : 'Roster / Schedule', icon: Calendar },
    { id: 'swaps', label: isEmployee ? 'My Swap Requests' : 'Swap Requests', icon: ArrowRightLeft },
    { id: 'bidding', label: 'Shift Bidding', icon: Star },
    { id: 'policy', label: 'Policy & Compliance', icon: FileCheck, hideForEmployee: true },
  ].filter(tab => !(isEmployee && tab.hideForEmployee));

  const getHeaderAction = () => {
    switch (activeTab) {
      case 'types': return { label: 'Create Shift Type', type: 'type' };
      case 'schedule': return { label: 'Assign Shift', type: 'assignment' };
      case 'swaps': return { label: 'Request Swap', type: 'swap' };
      case 'bidding': return { label: 'Place Bid', type: 'bid' };
      case 'policy': return { label: 'Create Policy', type: 'policy' };
      default: return null;
    }
  };

  const action = getHeaderAction();

  const handleActionClick = () => {
    setEditingType(null); 
    setEditingPolicy(null);
    setModalType(action.type);
    setShowModal(true);
  };

  const handleEditClick = (type) => {
    setEditingType(type);
    setModalType('type');
    setShowModal(true);
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shift type?")) return;
    try {
      await shiftService.deleteShiftType(id);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.detail || "Failed to delete shift type.");
    }
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy? This will fail if any shifts are using it.")) return;
    try {
      await shiftService.deletePolicy(id);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.detail || "Failed to delete policy.");
    }
  };

  const handleEditPolicyClick = (policy) => {
    setEditingPolicy(policy);
    setModalType('policy');
    setShowModal(true);
  };

  const handleGrantPointsClick = (bid) => {
    setSelectedBid(bid);
    setModalType('grantPoints');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      if (modalType === 'type') {
        const payload = {
          name: formData.get('name'),
          start_time: formData.get('start'),
          end_time: formData.get('end'),
          grace_period: parseInt(formData.get('grace') || 15),
          break_rules: formData.get('break') + 'm',
          ot_policy: formData.get('otPolicy'),
          is_auto_shift: formData.get('is_auto_shift') === 'on',
          policy_id: formData.get('policy_id') ? parseInt(formData.get('policy_id')) : null,
        };
        if (editingType) {
          await shiftService.updateShiftType(editingType.id, payload);
        } else {
          await shiftService.createShiftType(payload);
        }
      } else if (modalType === 'policy') {
        const payload = {
          name: formData.get('name'),
          is_auto_shift: formData.get('is_auto_shift') === 'on',
          ot_formula: formData.get('ot_formula') || 'not_applicable',
          ot_approval_role: formData.get('ot_approval_role') || 'Manager',
          night_allowance_enabled: formData.get('night_allowance_enabled') === 'on',
          week_off_1_day: formData.get('week_off_1_day') || null,
          week_off_2_day: formData.get('week_off_2_day') || null,
          week_off_2_week: formData.get('week_off_2_week') || null,
          highlight_late_check_in: formData.get('highlight_late_check_in') === 'on',
          highlight_early_check_out: formData.get('highlight_early_check_out') === 'on',
          highlight_ot: formData.get('highlight_ot') === 'on',
          highlight_week_off: formData.get('highlight_week_off') === 'on',
        };
        if (editingPolicy) {
          await shiftService.updatePolicy(editingPolicy.id, payload);
        } else {
          await shiftService.createPolicy(payload);
        }
      } else if (modalType === 'assignment') {
        const payload = {
          employee_id: parseInt(formData.get('employee_id')),
          shift_type_id: parseInt(formData.get('shift_type_id')),
          shift_date: formData.get('date'),
          status: 'Scheduled'
        };
        await shiftService.assignShift(payload);
      } else if (modalType === 'swap') {
        const payload = {
          shift_id: parseInt(formData.get('shift_id')),
          requested_by: user.id,
          swap_with_employee: parseInt(formData.get('swap_with_employee')),
          reason: formData.get('reason'),
          status: 'Pending'
        };
        await api.post('/shifts/swap-requests', payload);
      } else if (modalType === 'grantPoints') {
        const empId = employees.find(e => e.name === selectedBid.employee)?.id;
        if (!empId) throw new Error("Employee not found");
        await api.post(`/points/grant?employee_id=${empId}&amount=${formData.get('amount')}&reason=${formData.get('reason')}`);
        alert("Points granted successfully!");
      }
      fetchData();
      setShowModal(false);
    } catch (err) {
      console.error("Submission failed:", err);
      const errorMsg = err.response?.data?.detail || "Failed to save. Please check your data.";
      alert(errorMsg);
    }
  };

  const handleSwapAction = async (id, newStatus) => {
    try {
      await api.put(`/shifts/swap-requests/${id}/status?new_status=${newStatus}&approved_by=${user.id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to update swap status:", err);
    }
  };

  const handleBidAction = async (bidId, newStatus) => {
    try {
      // Temporary: update local state if backend endpoint doesn't exist yet
      // In a real app, this would be an API call
      setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: newStatus } : b));
      
      // Attempt API call (we'll create this next)
      try {
        await api.put(`/shifts/bids/${bidId}/status?status=${newStatus}`);
      } catch (e) {
        console.warn("Backend bid endpoint not ready, but state updated locally.");
      }
    } catch (err) {
      console.error("Failed to update bid status:", err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Shifts & Workforce Scheduling (VERIFIED V2)</h1>
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

      {activeTab === 'types' && <ShiftTypesTab shiftTypes={shiftTypes} onEdit={handleEditClick} onDelete={handleDeleteType} />}
      {activeTab === 'schedule' && <ScheduleTab formatDateRange={formatDateRange} handlePrevWeek={handlePrevWeek} handleToday={handleToday} handleNextWeek={handleNextWeek} getWeekDays={getWeekDays} displaySchedule={displaySchedule} employees={employees} />}
      {activeTab === 'swaps' && <SwapsTab displaySwaps={displaySwaps} isEmployee={isEmployee} user={user} handleSwapAction={handleSwapAction} />}
      {activeTab === 'policy' && <PolicyTab policies={policies} onEditPolicy={handleEditPolicyClick} onDeletePolicy={handleDeletePolicy} />}
      {activeTab === 'bidding' && <BiddingTab displayBids={displayBids} isAdmin={!isEmployee} onGrantPoints={handleGrantPointsClick} onBidAction={handleBidAction} />}

      {showModal && (
        <ShiftModals
          modalType={modalType}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          editingType={editingType}
          editingPolicy={editingPolicy}
          actionLabel={action?.label}
          policies={policies}
          employees={employees}
          shiftTypes={shiftTypes}
          rawShifts={rawShifts}
          user={user}
          selectedBid={selectedBid}
        />
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
