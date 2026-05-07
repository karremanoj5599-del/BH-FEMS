import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, 
  Calendar as CalendarIcon, Save, RefreshCw,
  AlertCircle, CheckCircle2, User, Clock
} from 'lucide-react';
import api from '../../services/api';

export default function EmployeeShiftPlanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState({}); // { 'YYYY-MM-DD': type_id }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, typesRes, shiftsRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get('/shifts/types'),
        api.get('/shifts/', { 
          params: { 
            employee_id: id,
            start_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
            end_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
          } 
        })
      ]);

      setEmployee(empRes.data);
      setShiftTypes(typesRes.data);
      
      const existing = {};
      shiftsRes.data.forEach(s => {
        existing[s.shift_date] = s.shift_type_id;
      });
      setAssignments(existing);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setMessage({ type: 'error', text: 'Failed to load employee data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, currentDate.getMonth(), currentDate.getFullYear()]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill previous month padding
    const firstDayIndex = date.getDay(); // 0 is Sunday
    // Adjust to Monday start
    const padding = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = padding; i > 0; i--) {
      days.push({ 
        day: prevMonthLastDay - i + 1, 
        month: 'prev', 
        date: new Date(year, month - 1, prevMonthLastDay - i + 1) 
      });
    }

    // Fill current month
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push({ 
        day: i, 
        month: 'current', 
        date: new Date(year, month, i) 
      });
    }

    // Fill next month padding
    const totalSoFar = days.length;
    const remaining = 42 - totalSoFar; // 6 rows of 7 days
    for (let i = 1; i <= remaining; i++) {
      days.push({ 
        day: i, 
        month: 'next', 
        date: new Date(year, month + 1, i) 
      });
    }

    return days;
  }, [currentDate]);

  const handleShiftChange = (dateStr, typeId) => {
    setAssignments(prev => ({
      ...prev,
      [dateStr]: typeId === 'none' ? null : parseInt(typeId)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        employee_id: parseInt(id),
        shifts: Object.entries(assignments)
          .filter(([_, typeId]) => typeId !== null)
          .map(([date, typeId]) => ({
            employee_id: parseInt(id),
            shift_type_id: typeId,
            shift_date: date,
            status: 'Scheduled'
          }))
      };

      await api.post('/shifts/bulk', payload);
      setMessage({ type: 'success', text: 'Monthly shift plan saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setMessage({ type: 'error', text: 'Failed to save shift plan.' });
    } finally {
      setSaving(false);
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  if (loading && !employee) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in employee-planner-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/shifts')} style={{ padding: 8 }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Monthly Shift Planner</h1>
            <p>Assigning shifts for <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{employee?.name}</span></p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="calendar-controls" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-2)', padding: '6px 12px', borderRadius: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
            <span style={{ fontWeight: 700, fontSize: 16, minWidth: 140, textAlign: 'center' }}>{monthName} {year}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Monthly Plan'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ 
          marginBottom: 20, 
          padding: '12px 16px', 
          borderRadius: 8, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: message.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Employee Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
             <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface-3)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary-500)' }}>
                <User size={40} color="var(--primary-400)" />
             </div>
             <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{employee?.name}</h3>
             <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{employee?.designation} • {employee?.employee_id}</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{employee?.department_name || 'N/A'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Team</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{employee?.team_name || 'N/A'}</div>
             </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Available Shift Types</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {shiftTypes.map(type => (
                <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{type.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{type.start_time.substring(0, 5)} - {type.end_time.substring(0, 5)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Planner Calendar */}
        <div className="card" style={{ padding: 24 }}>
          <div className="planner-calendar">
            <div className="calendar-header-row">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="calendar-header-cell">{day}</div>
              ))}
            </div>
            <div className="calendar-days-row">
              {daysInMonth.map((item, idx) => {
                const dateStr = item.date.toISOString().split('T')[0];
                const currentShift = assignments[dateStr];
                const isToday = new Date().toDateString() === item.date.toDateString();
                const isCurrentMonth = item.month === 'current';

                return (
                  <div 
                    key={idx} 
                    className={`calendar-day-cell ${!isCurrentMonth ? 'padding-day' : ''} ${isToday ? 'is-today' : ''}`}
                    style={{ minHeight: 120 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className="day-number">{item.day}</span>
                      {isToday && <span style={{ fontSize: 9, background: 'var(--primary-500)', color: 'white', padding: '1px 4px', borderRadius: 4 }}>TODAY</span>}
                    </div>
                    
                    {isCurrentMonth && (
                      <select 
                        className="form-select select-sm" 
                        value={currentShift || 'none'}
                        onChange={(e) => handleShiftChange(dateStr, e.target.value)}
                        style={{ 
                          fontSize: 11, 
                          padding: '4px 8px', 
                          height: 'auto', 
                          background: currentShift ? 'rgba(99,102,241,0.1)' : 'var(--bg-surface)', 
                          borderColor: currentShift ? 'var(--primary-500)' : 'var(--border-subtle)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="none" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>-- Off --</option>
                        {shiftTypes.map(type => (
                          <option key={type.id} value={type.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{type.name}</option>
                        ))}
                      </select>
                    )}
                    
                    {currentShift && isCurrentMonth && (
                      <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} />
                        {shiftTypes.find(t => t.id === currentShift)?.start_time.substring(0, 5)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .planner-calendar { width: 100%; }
        .calendar-header-row { display: grid; grid-template-columns: repeat(7, 1fr); padding-bottom: 12px; }
        .calendar-header-cell { text-align: center; font-weight: 700; color: var(--text-muted); text-transform: uppercase; font-size: 12px; }
        .calendar-days-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border-subtle); border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; }
        .calendar-day-cell { background: var(--surface-1); padding: 12px; display: flex; flex-direction: column; transition: all 0.2s; }
        .calendar-day-cell.padding-day { opacity: 0.3; background: var(--surface-2); }
        .calendar-day-cell.is-today { background: rgba(99, 102, 241, 0.03); }
        .day-number { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .select-sm { border-radius: 6px; cursor: pointer; }
        .select-sm:hover { border-color: var(--primary-400); }
      `}</style>
    </div>
  );
}
