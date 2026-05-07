import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Clock, Calendar, ChevronLeft, ChevronRight, 
  AlertCircle, Timer, Coffee, Moon, Sun, 
  ArrowRightLeft, Info, X
} from 'lucide-react';

export default function MyShiftsPage() {
  const getLocalDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('swap');
  const [shiftTypes, setShiftTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [modalDate, setModalDate] = useState(getLocalDateString(new Date()));
  const [myModalShifts, setMyModalShifts] = useState([]);
  const [colleagueModalShifts, setColleagueModalShifts] = useState([]);
  const [selectedColleague, setSelectedColleague] = useState('');

  const [weekStart, setWeekStart] = useState(getMonday(new Date()));

  const fetchMyShifts = async () => {
    setLoading(true);
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const res = await api.get('/shifts/my', {
        params: {
          start_date: getLocalDateString(weekStart),
          end_date: getLocalDateString(weekEnd)
        }
      });
      setShifts(res.data);

      // Fetch metadata for swaps if not already loaded
      if (shiftTypes.length === 0 || employees.length === 0) {
        const [typesRes, empRes] = await Promise.all([
          api.get('/shifts/types'),
          api.get('/employees/list/minimal')
        ]);
        setShiftTypes(typesRes.data);
        setEmployees(empRes.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch my shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShifts();
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, [weekStart]);

  const fetchShiftsOnDate = async (date, colleagueId = null) => {
    if (!date) return;
    try {
      // Fetch my shifts for that date
      const myRes = await api.get('/shifts/my', {
        params: { start_date: date, end_date: date }
      });
      setMyModalShifts(myRes.data);

      // Fetch colleague shifts if selected
      if (colleagueId) {
        const collRes = await api.get('/shifts/', {
          params: { 
            employee_id: colleagueId,
            start_date: date,
            end_date: date
          }
        });
        setColleagueModalShifts(collRes.data);
      } else {
        setColleagueModalShifts([]);
      }
    } catch (err) {
      console.error("Failed to fetch modal shifts:", err);
    }
  };

  const handleModalDateChange = (e) => {
    const newDate = e.target.value;
    setModalDate(newDate);
    fetchShiftsOnDate(newDate, selectedColleague);
  };

  const handleColleagueChange = (e) => {
    const collId = e.target.value;
    setSelectedColleague(collId);
    fetchShiftsOnDate(modalDate, collId);
  };

  const handleActionClick = (type) => {
    setModalType(type);
    setModalDate(getLocalDateString(new Date()));
    setSelectedColleague('');
    setMyModalShifts([]);
    setColleagueModalShifts([]);
    setShowModal(true);
    // Auto fetch today's shifts
    fetchShiftsOnDate(getLocalDateString(new Date()));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      if (modalType === 'swap') {
        const payload = {
          shift_id: parseInt(formData.get('shift_id')),
          target_shift_id: formData.get('target_shift_id') ? parseInt(formData.get('target_shift_id')) : null,
          requested_by: user.id,
          swap_with_employee: parseInt(formData.get('swap_with_employee')),
          reason: formData.get('reason'),
          status: 'Pending'
        };
        await api.post('/shifts/swap-requests', payload);
        alert("Swap request submitted successfully!");
      }
      setShowModal(false);
      fetchMyShifts();
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err.response?.data?.detail || "Failed to submit request.");
    }
  };

  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const handleToday = () => {
    setWeekStart(getMonday(new Date()));
  };

  const todayStr = getLocalDateString(currentDate);
  const todayShift = shifts.find(s => s.shift_date === todayStr);

  const getShiftIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('night')) return <Moon size={20} />;
    if (n.includes('morning')) return <Sun size={20} />;
    if (n.includes('evening')) return <Coffee size={20} />;
    return <Clock size={20} />;
  };

  const getWeekDays = () => {
    const days = [];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dStr = getLocalDateString(d);
      const shift = shifts.find(s => s.shift_date === dStr);
      days.push({
        label: labels[i],
        date: d.getDate(),
        fullDate: dStr,
        shift: shift,
        isToday: dStr === todayStr
      });
    }
    return days;
  };

  return (
    <div className="animate-fade-in my-shifts-page">
      <div className="page-header">
        <div>
          <h1>My Shifts</h1>
          <p>View your assigned work schedule and manage your time.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="btn btn-secondary" onClick={handleToday}>
             Today
           </button>
           <div className="card" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.03)' }}>
              <button className="btn btn-ghost btn-sm" onClick={handlePrevWeek}><ChevronLeft size={16} /></button>
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 160, textAlign: 'center' }}>
                {weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleNextWeek}><ChevronRight size={16} /></button>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left Column: Today's Shift & Weekly Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Today's Shift Card */}
          <div className="card" style={{ 
            padding: 0, overflow: 'hidden', 
            background: todayShift ? 'linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%)' : 'var(--surface-1)',
            border: todayShift ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)'
          }}>
            <div style={{ 
              padding: '16px 24px', background: todayShift ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', 
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Timer size={18} color="var(--primary-400)" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Today's Assignment</span>
              </div>
              <span className={`badge ${todayShift ? 'badge-active' : 'badge-danger'}`}>
                {todayShift ? 'Scheduled' : 'No Shift'}
              </span>
            </div>
            
            <div style={{ padding: '32px 24px' }}>
              {todayShift ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 40, alignItems: 'center' }}>
                  <div style={{ 
                    width: 80, height: 80, borderRadius: 20, 
                    background: 'rgba(99,102,241,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' 
                  }}>
                    {getShiftIcon(todayShift.shift_type?.name)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{todayShift.shift_type?.name}</h2>
                    <div style={{ fontSize: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={16} /> {todayShift.shift_type?.start_time} — {todayShift.shift_type?.end_time}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Status</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success-400)' }}>Confirmed</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Info size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                  <h3 style={{ color: 'var(--text-muted)' }}>You have no shift scheduled for today.</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Enjoy your time off or contact your supervisor if this is an error.</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Grid */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Weekly Schedule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
              {getWeekDays().map(day => (
                <div key={day.fullDate} style={{ 
                  padding: '16px 12px', borderRadius: 16, 
                  background: day.isToday ? 'rgba(99,102,241,0.05)' : 'var(--surface-2)',
                  border: day.isToday ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  opacity: day.shift ? 1 : 0.6
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{day.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{day.date}</div>
                  <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {day.shift ? (
                      <div title={day.shift.shift_type?.name} style={{ color: 'var(--primary-400)' }}>
                        {getShiftIcon(day.shift.shift_type?.name)}
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger-400)' }}>OFF</span>
                    )}
                  </div>
                  {day.shift && (
                    <div style={{ fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {day.shift.shift_type?.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Policies & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Shift Policies */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} color="var(--primary-400)" /> Shift Policies
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Grace Period</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>15 minutes late allowed for all shifts.</div>
              </div>
              <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Break Rules</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>45m mandatory break for 8h+ shifts.</div>
              </div>
              <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>OT Policy</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Only pre-approved overtime is paid.</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ background: 'rgba(99,102,241,0.03)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Need a Change?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                className="btn btn-secondary btn-block" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => handleActionClick('swap')}
              >
                <ArrowRightLeft size={16} /> Request Shift Swap
              </button>
              <button className="btn btn-ghost btn-block" style={{ fontSize: 12 }}>
                Report Attendance Issue
              </button>
            </div>
          </div>

          {/* Weather/Context (Optional flavor) */}
          <div className="card" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.02)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <AlertCircle size={20} color="var(--warning-400)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Safety Reminder</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Ensure you wear high-visibility gear for night shifts.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Swap Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Shift Swap</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    name="modal_date" 
                    className="form-input" 
                    value={modalDate}
                    onChange={handleModalDateChange}
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Your Shift</label>
                    <select name="shift_id" className="form-select" required>
                      <option value="">Select shift...</option>
                      {myModalShifts.map(sh => (
                        <option key={sh.id} value={sh.id}>
                          {sh.shift_type?.name} ({sh.shift_type?.start_time})
                        </option>
                      ))}
                      {myModalShifts.length === 0 && <option disabled>No shifts on this date</option>}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Colleague to Swap With</label>
                    <select 
                      name="swap_with_employee" 
                      className="form-select" 
                      required
                      value={selectedColleague}
                      onChange={handleColleagueChange}
                    >
                      <option value="">Select colleague...</option>
                      {employees.filter(e => e.id !== user?.id).map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shift to Receive (Colleague's Shift)</label>
                  <select name="target_shift_id" className="form-select" required>
                    <option value="">Select their shift...</option>
                    {colleagueModalShifts.map(sh => (
                      <option key={sh.id} value={sh.id}>
                        {sh.shift_type?.name} ({sh.shift_type?.start_time})
                      </option>
                    ))}
                    {selectedColleague && colleagueModalShifts.length === 0 && <option disabled>No shifts found for colleague on this date</option>}
                    {!selectedColleague && <option disabled>Please select a colleague first</option>}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea name="reason" className="form-input" placeholder="Reason for swap request..." required style={{ minHeight: 100 }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .my-shifts-page .badge { padding: 6px 12px; font-size: 11px; font-weight: 700; border-radius: 20px; }
        .btn-block { width: 100%; }
      `}</style>
    </div>
  );
}
