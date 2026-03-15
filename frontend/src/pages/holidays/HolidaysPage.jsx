import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Info, 
  ChevronRight, Star, Clock, Bell, Map,
  ChevronLeft, ArrowUpRight
} from 'lucide-react';

const HOLIDAYS = [
  { id: 1, name: 'Holi', date: '2026-03-14', type: 'Public', day: 'Saturday', description: 'Festival of Colors' },
  { id: 2, name: 'Good Friday', date: '2026-04-03', type: 'Public', day: 'Friday', description: 'Religious observance' },
  { id: 3, name: 'Eid al-Fitr', date: '2026-04-20', type: 'Public', day: 'Monday', description: 'End of Ramadan' },
  { id: 4, name: 'Labor Day', date: '2026-05-01', type: 'Public', day: 'Friday', description: 'International Workers Day' },
  { id: 5, name: 'Buddha Purnima', date: '2026-05-22', type: 'Restricted', day: 'Friday', description: 'Optional holiday for Buddhist employees' },
];

export default function HolidaysPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getNextHoliday = () => HOLIDAYS[0];
  const nextHoliday = getNextHoliday();

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Holiday Calendar 2026</h1>
          <p>Plan your work and time off around public and restricted holidays</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">
            <Bell size={16} /> Notification Settings
          </button>
          <button className="btn btn-primary">
            <CalendarIcon size={16} /> Sync to Google
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 24 }}>
        {/* Main List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Upcoming Holidays</h3>
            <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-400)' }} /> Public
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning-400)' }} /> Restricted
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HOLIDAYS.map(holiday => (
              <div key={holiday.id} className="card" style={{ 
                background: 'var(--surface-3)', 
                border: '1px solid var(--border-subtle)',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-500)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {new Date(holiday.date).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>{new Date(holiday.date).getDate()}</div>
                  </div>
                  <div style={{ width: 1, height: 40, background: 'var(--border-subtle)' }} />
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{holiday.name}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{holiday.day} • {holiday.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className={`badge ${holiday.type === 'Public' ? 'badge-active' : 'badge-pending'}`} style={{ 
                    background: holiday.type === 'Public' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: holiday.type === 'Public' ? 'var(--primary-400)' : 'var(--warning-400)'
                  }}>
                    {holiday.type}
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ padding: 4 }}><ArrowUpRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Next Holiday Countdown */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))', color: 'white', border: 'none' }}>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>Next Upcoming Holiday</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{nextHoliday.name}</h2>
            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>Starts in 3 days</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8 }}>
              <Clock size={16} />
              <span>Saturday, 14th March</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={18} color="var(--warning-400)" /> Restricted Holidays (RH)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              You are eligible for <strong>2 Restricted Holidays</strong> per year. Please apply for them via the Leave module like a regular leave request.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Annual Quota</span>
                <span style={{ fontWeight: 600 }}>2 Days</span>
              </div>
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                <span>Balance Available</span>
                <span style={{ fontWeight: 600, color: 'var(--success-400)' }}>2 Days</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Map size={18} color="var(--primary-400)" /> Location Policy
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Holiday calendars are specific to your home location (New Delhi HQ). For field travel during holidays, please check with your supervisor for regional adjustment.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'rgba(99, 102, 241, 0.02)', textAlign: 'center', padding: '32px 20px' }}>
        <h3 style={{ marginBottom: 12 }}>Need to plan a long weekend?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 500, margin: '0 auto 20px' }}>
          Check your team's availability and combined holiday periods to ensure smooth project delivery while you are away.
        </p>
        <button className="btn btn-outline">Check Team Calendar</button>
      </div>
    </div>
  );
}
