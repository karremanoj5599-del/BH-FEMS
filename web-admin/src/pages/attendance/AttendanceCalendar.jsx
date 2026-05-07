import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, 
  Calendar as CalendarIcon, Clock, MapPin,
  CheckCircle2, AlertTriangle, XCircle, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AttendanceCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/me');
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill previous month padding
    const firstDayIndex = date.getDay(); // 0 is Sunday
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({ day: prevMonthLastDay - i + 1, month: 'prev', date: new Date(year, month - 1, prevMonthLastDay - i + 1) });
    }

    // Fill current month
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push({ day: i, month: 'current', date: new Date(year, month, i) });
    }

    // Fill next month padding
    const lastDayIndex = new Date(year, month + 1, 0).getDay();
    const nextDays = 6 - lastDayIndex;
    for (let i = 1; i <= nextDays; i++) {
      days.push({ day: i, month: 'next', date: new Date(year, month + 1, i) });
    }

    return days;
  }, [currentDate]);

  const getAttendanceForDate = (date) => {
    const dStr = date.toISOString().split('T')[0];
    return history.filter(h => h.check_in && h.check_in.split('T')[0] === dStr);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in attendance-calendar-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ padding: 8 }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Attendance Calendar</h1>
            <p>Review your historical presence and work patterns</p>
          </div>
        </div>
        
        <div className="calendar-controls" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-2)', padding: '6px 12px', borderRadius: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
          <span style={{ fontWeight: 700, fontSize: 16, minWidth: 140, textAlign: 'center' }}>{monthName} {year}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Calendar Grid */}
        <div className="card" style={{ padding: 24 }}>
          <div className="calendar-grid">
            <div className="calendar-header-row">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-header-cell">{day}</div>
              ))}
            </div>
            <div className="calendar-days-row">
              {daysInMonth.map((item, idx) => {
                const dateAttendance = getAttendanceForDate(item.date);
                const hasAttendance = dateAttendance.length > 0;
                const status = hasAttendance ? dateAttendance[0].status : null;
                const isToday = new Date().toDateString() === item.date.toDateString();

                return (
                  <div 
                    key={idx} 
                    className={`calendar-day-cell ${item.month !== 'current' ? 'padding-day' : ''} ${isToday ? 'is-today' : ''}`}
                  >
                    <div className="day-number">{item.day}</div>
                    {item.month === 'current' && (
                      <div className="attendance-indicators">
                        {dateAttendance.map((session, sIdx) => (
                          <div 
                            key={sIdx} 
                            className={`attendance-pill ${session.status.toLowerCase()}`}
                            title={`${session.status} - In: ${new Date(session.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          >
                            <span className="dot" />
                            {session.status}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={18} color="var(--primary-400)" /> Legend
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="legend-item">
                <div className="legend-color present" />
                <div className="legend-text">
                  <span style={{ fontWeight: 600 }}>Present / On-Time</span>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Punched in within grace period</p>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color late" />
                <div className="legend-text">
                  <span style={{ fontWeight: 600 }}>Late Arrival</span>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Punched in after grace period</p>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color absent" />
                <div className="legend-text">
                  <span style={{ fontWeight: 600 }}>Absent / Leave</span>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>No record or approved time off</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--surface-3)', border: '1px solid var(--primary-500)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
              <CalendarIcon size={120} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-400)', textTransform: 'uppercase', marginBottom: 16 }}>Monthly Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="stat-mini">
                <div className="stat-label">Present</div>
                <div className="stat-value">{history.filter(h => h.status === 'Present' || h.status === 'On-Time').length}</div>
              </div>
              <div className="stat-mini">
                <div className="stat-label">Late</div>
                <div className="stat-value" style={{ color: 'var(--warning-400)' }}>{history.filter(h => h.status === 'Late').length}</div>
              </div>
              <div className="stat-mini">
                <div className="stat-label">Avg. In</div>
                <div className="stat-value" style={{ fontSize: 14 }}>08:45 AM</div>
              </div>
              <div className="stat-mini">
                <div className="stat-label">Total Hrs</div>
                <div className="stat-value" style={{ fontSize: 14 }}>168h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .calendar-grid {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .calendar-header-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .calendar-header-cell {
          text-align: center;
          font-weight: 700;
          font-size: 13,
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .calendar-days-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: minmax(100px, auto);
          gap: 1px;
          background: var(--border-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-day-cell {
          background: var(--surface-1);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s ease;
          position: relative;
        }
        .calendar-day-cell:hover {
          background: var(--surface-2);
        }
        .calendar-day-cell.padding-day {
          opacity: 0.3;
          background: var(--surface-2);
        }
        .calendar-day-cell.is-today {
          background: rgba(99, 102, 241, 0.05);
        }
        .calendar-day-cell.is-today .day-number {
          background: var(--primary-500);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .day-number {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .attendance-indicators {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .attendance-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          text-transform: uppercase;
        }
        .attendance-pill.present, .attendance-pill.on-time {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .attendance-pill.late {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
        .attendance-pill.absent {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .attendance-pill .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: currentColor;
        }
        .legend-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          margin-top: 4px;
          flex-shrink: 0;
        }
        .legend-color.present { background: #10b981; }
        .legend-color.late { background: #f59e0b; }
        .legend-color.absent { background: #ef4444; }
        .legend-text span { display: block; font-size: 13px; }
        .stat-mini {
          background: rgba(255,255,255,0.03);
          padding: 10px;
          border-radius: 8px;
        }
        .stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .stat-value { font-size: 18px; font-weight: 800; }
      `}</style>
    </div>
  );
}
