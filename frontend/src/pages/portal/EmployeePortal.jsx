import React, { useState, useEffect } from 'react';
import { 
  Clock, MapPin, CalendarDays, ClipboardList, 
  TrendingUp, CheckCircle, AlertCircle, Play, 
  LogOut, Timer, Map, ListTodo, Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EmployeePortal() {
  const { user } = useAuth();
  const [clockedIn, setClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Shift Time', value: '06h 45m', icon: Timer, color: 'var(--primary-400)' },
    { label: 'Tasks Done', value: '12/15', icon: CheckCircle, color: 'var(--success-400)' },
    { label: 'Attendance', value: '98%', icon: TrendingUp, color: 'var(--accent-400)' },
  ];

  const recentTasks = [
    { id: 1, title: 'Check Power Grid B', site: 'Substation Alpha', time: '10:00 AM', status: 'Completed' },
    { id: 2, title: 'Replace Transformer Fuse', site: 'Main Plant', time: '02:30 PM', status: 'Upcoming' },
  ];

  return (
    <div className="animate-fade-in employee-portal">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1>Employee Portal</h1>
          <p>Welcome, {user?.name || 'Field Professional'}! Stay updated with your field schedule.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.03)' }}>
            <CalendarDays size={18} color="var(--primary-400)" />
            <span style={{ fontWeight: 600 }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Status Bar */}
          <div className="card" style={{ 
            background: clockedIn ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)' : 'var(--surface-1)',
            border: clockedIn ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-subtle)',
            padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ 
                width: 54, height: 54, borderRadius: 16, 
                background: clockedIn ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: clockedIn ? 'var(--success-400)' : 'var(--primary-400)'
              }}>
                <Clock size={28} className={clockedIn ? 'animate-pulse' : ''} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {clockedIn ? 'Working: Morning Shift' : 'Not Clocked In'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  <MapPin size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                  Current Site: {clockedIn ? 'Substation Alpha' : 'None'}
                </p>
              </div>
            </div>
            <button 
              className={`btn ${clockedIn ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={() => setClockedIn(!clockedIn)}
              style={{ padding: '12px 32px', height: 'auto', borderRadius: 12, fontSize: 16, fontWeight: 600 }}
            >
              {clockedIn ? <><LogOut size={18} /> Clock Out</> : <><Play size={18} /> Clock In</>}
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {stats.map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <s.icon size={20} color={s.color} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Activity/Task Summary */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ListTodo size={18} color="var(--primary-400)" /> Today's Focus
              </h3>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-400)' }}>View All Tasks</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentTasks.map(task => (
                <div key={task.id} style={{ 
                  padding: 16, background: 'var(--surface-2)', borderRadius: 12, 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {task.site} • {task.time}
                    </div>
                  </div>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-active' : 'badge-pending'}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Site Map Snapshot */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 180, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Map size={48} style={{ opacity: 0.1 }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 600 }}>SIT-001 • Substation Alpha</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>1.2km from your location</div>
              </div>
              {/* Fake Marker */}
              <div style={{ position: 'absolute', top: '40%', left: '50%', color: 'var(--danger-400)', animation: 'bounce 2s infinite' }}>
                <MapPin size={32} />
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                <Navigation size={16} /> Open Navigator
              </button>
            </div>
          </div>

          {/* Leave Highlights */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Leaves & Time Off</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Earned Leave</span>
                <span style={{ fontWeight: 600 }}>12 Days Left</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3 }}>
                <div style={{ width: '70%', height: '100%', background: 'var(--primary-400)', borderRadius: 3 }} />
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>Apply for Time Off</button>
            </div>
          </div>

          {/* Support/Alerts */}
          <div className="card" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.02)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <AlertCircle size={20} color="var(--warning-400)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Weather Alert</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Heavy rain expected at Substation Alpha. Carry protective gear.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        .employee-portal .badge { padding: 4px 10px; font-size: 11px; }
      `}</style>
    </div>
  );
}
