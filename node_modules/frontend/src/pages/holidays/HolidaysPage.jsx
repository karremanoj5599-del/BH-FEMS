import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Calendar as CalendarIcon, MapPin, Info, 
  ChevronRight, Star, Clock, Bell, Map,
  ChevronLeft, ArrowUpRight, Plus, Edit2, Trash2, X, AlertCircle
} from 'lucide-react';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    holiday_date: '',
    description: '',
    is_restricted: false,
    is_floating: false
  });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await api.get('/holidays/');
      setHolidays(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch holidays:", err);
      setError("Failed to load holiday calendar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const openAdd = () => {
    setEditingHoliday(null);
    setFormData({
      name: '',
      holiday_date: new Date().toISOString().split('T')[0],
      description: '',
      is_restricted: false,
      is_floating: false
    });
    setShowModal(true);
  };

  const openEdit = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      holiday_date: holiday.holiday_date,
      description: holiday.description || '',
      is_restricted: holiday.is_restricted,
      is_floating: holiday.is_floating
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      alert('Error deleting holiday');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await api.put(`/holidays/${editingHoliday.id}`, formData);
      } else {
        await api.post('/holidays/', formData);
      }
      setShowModal(false);
      fetchHolidays();
    } catch (err) {
      console.error("Save error:", err.response?.data);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : 'Error saving holiday');
    }
  };

  const handleSyncGoogle = () => {
    // Redirects the user directly to Google Calendar's Holiday settings
    // so they can enable and see this year's holidays without downloading any files.
    window.open('https://calendar.google.com/calendar/u/0/r/settings/addholidays', '_blank');
  };

  const getNextHoliday = () => {
    const today = new Date().toISOString().split('T')[0];
    return holidays.find(h => h.holiday_date >= today) || holidays[0];
  };

  const nextHoliday = holidays.length > 0 ? getNextHoliday() : null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      day: date.getDate(),
      fullDay: date.toLocaleString('default', { weekday: 'long' }),
      formatted: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  if (loading && holidays.length === 0) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Holiday Calendar 2026</h1>
          <p>Plan your work and time off around public and restricted holidays</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => fetchHolidays()}>
            <Bell size={16} /> Notification Settings
          </button>
          <button className="btn btn-secondary" onClick={() => {
            if (holidays.length === 0) {
              alert("No holidays to sync.");
              return;
            }
            handleSyncGoogle();
          }} disabled={syncing}>
            <CalendarIcon size={16} /> {syncing ? 'Syncing...' : 'Sync to Google'}
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Holiday
          </button>
        </div>
      </div>


      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger-500)', marginBottom: 24, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle color="var(--danger-400)" size={20} />
          <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={fetchHolidays} style={{ marginLeft: 'auto' }}>Retry</button>
        </div>
      )}

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
            {holidays.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <CalendarIcon size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p>No holidays found in the calendar</p>
                <button className="btn btn-link" onClick={openAdd}>Add your first holiday</button>
              </div>
            ) : (
              holidays.map(holiday => {
                const dateInfo = formatDate(holiday.holiday_date);
                return (
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
                          {dateInfo.month}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{dateInfo.day}</div>
                      </div>
                      <div style={{ width: 1, height: 40, background: 'var(--border-subtle)' }} />
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{holiday.name}</h4>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{dateInfo.fullDay} • {holiday.description || 'No description'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className={`badge ${!holiday.is_restricted ? 'badge-active' : 'badge-pending'}`} style={{ 
                        background: !holiday.is_restricted ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: !holiday.is_restricted ? 'var(--primary-400)' : 'var(--warning-400)'
                      }}>
                        {holiday.is_restricted ? 'Restricted' : 'Public'}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 4 }} onClick={() => openEdit(holiday)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 4, color: 'var(--danger-400)' }} onClick={() => handleDelete(holiday.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Next Holiday Countdown */}
          {nextHoliday && (
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))', color: 'white', border: 'none' }}>
              <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>Next Upcoming Holiday</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{nextHoliday.name}</h2>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>
                {new Date(nextHoliday.holiday_date) > new Date() 
                  ? `Starts in ${Math.ceil((new Date(nextHoliday.holiday_date) - new Date()) / (1000 * 60 * 60 * 24))} days`
                  : 'Today'}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8 }}>
                <Clock size={16} />
                <span>{formatDate(nextHoliday.holiday_date).formatted}</span>
              </div>
            </div>
          )}

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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Holiday Name *</label>
                    <input className="form-input" placeholder="e.g. Diwali" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" value={formData.holiday_date}
                      onChange={(e) => setFormData({ ...formData, holiday_date: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="Optional details..." value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: 80 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={formData.is_restricted} 
                        onChange={(e) => setFormData({ ...formData, is_restricted: e.target.checked })}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      Restricted Holiday
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={formData.is_floating} 
                        onChange={(e) => setFormData({ ...formData, is_floating: e.target.checked })}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      Floating Holiday
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingHoliday ? 'Update Holiday' : 'Add Holiday'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
