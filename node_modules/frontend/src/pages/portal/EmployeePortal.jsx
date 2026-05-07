import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, ClipboardList, 
  TrendingUp, CheckCircle, AlertCircle,
  Timer, ListTodo, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EmployeePortal() {
  const { user } = useAuth();
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
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ListTodo size={20} color="var(--primary-400)" /> Today's Focus
              </h3>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>View All Tasks</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recentTasks.map(task => (
                <div key={task.id} style={{ 
                  padding: '16px 20px', background: 'var(--surface-2)', borderRadius: 16, 
                  display: 'flex', alignItems: 'center', gap: 16,
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }} className="focus-card">
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: task.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ClipboardList size={20} color={task.status === 'Completed' ? '#10b981' : 'var(--primary-400)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {task.site} • <Timer size={11} /> {task.time}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: task.status === 'Completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    color: task.status === 'Completed' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${task.status === 'Completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
                  }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
        .employee-portal .badge { padding: 4px 10px; font-size: 11px; }
        .focus-card:hover {
          border-color: var(--primary-400) !important;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
