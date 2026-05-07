import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MapPin, Navigation, 
  Camera, Image as ImageIcon, Send, 
  CheckCircle2, Play, LogOut, Loader2, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WorkExecutionPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null); // Active SiteAttendance session
  const [appStatus, setAppStatus] = useState({ is_clocked_in: null }); // null = loading/unknown

  const [data, setData] = useState(null); // Task or Site data
  const [photos, setPhotos] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchStatus();
  }, [type, id]);

  const fetchData = async () => {
    try {
      const endpoint = type === 'task' ? `/tasks/${id}` : `/sites/${id}`;
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance/status');
      setAppStatus({ is_clocked_in: res.data.is_clocked_in });
      
      // If we have an active session for THIS task/site, use it
      if (res.data.site_session && res.data.site_session.site_id === (type === 'site' ? parseInt(id) : res.data.site_session.site_id)) {
         setSession(res.data.site_session);
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  const handleStart = async () => {
    try {
      const payload = {
        site_id: type === 'site' ? id : data?.site_id,
        task_id: type === 'task' ? id : null
      };
      const res = await api.post('/attendance/site/start', null, { params: payload });
      setSession(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to start trip";
      alert(typeof msg === 'string' ? msg : "Failed to start trip. Please check your app check-in status.");
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await api.post(`/attendance/site/${session.id}/check-in`);
      setSession(res.data);
    } catch (err) {
      alert("Failed to check in");
    }
  };

  const handleComplete = async () => {
    if (!remarks) {
      alert("Please add remarks before completing.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        notes: remarks,
        photos: JSON.stringify(photos)
      };
      const res = await api.post(`/attendance/site/${session.id}/complete`, null, { params: payload });
      setSession(res.data);
    } catch (err) {
      alert("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post(`/attendance/site/${session.id}/check-out`);
      navigate(type === 'task' ? '/tasks' : '/my-sites');
    } catch (err) {
      alert("Failed to check out");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 20) {
      alert("Maximum 20 photos allowed.");
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  if (loading) return <div className="loading-spinner"><Loader2 className="spinner" /></div>;
  if (!data) return <div className="error-view"><AlertCircle /> <p>Execution target not found.</p></div>;

  const status = session?.status || 'Pending';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Work Execution</h1>
          <p style={{ color: 'var(--text-muted)' }}>{type === 'task' ? 'Task #' : 'Site ID: '}{id}</p>
        </div>
      </div>

      {/* Card 1: Info */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
             <span style={{
                background: 'rgba(99,102,241,0.1)', color: 'var(--primary-400)',
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'monospace'
             }}>
                {type.toUpperCase()} EXECUTION
             </span>
             <span className={`badge ${status === 'On Site' ? 'badge-active' : 'badge-pending'}`} style={{ padding: '4px 12px', borderRadius: 12 }}>
                {status}
             </span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{data.title || data.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {data.description || 'Proceed with site verification and maintenance.'}
          </p>
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', gap: 24, fontSize: 13, background: 'var(--surface-1)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <Clock size={16} color="var(--primary-400)" />
              <span style={{ fontWeight: 600 }}>{data.priority || 'Medium'} Priority</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <MapPin size={16} color="var(--primary-400)" />
              <span style={{ fontWeight: 600 }}>{data.location || data.address || 'Site Location'}</span>
           </div>
        </div>
      </div>

      {/* Grid for Navigation and Clock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        
        {/* Navigation Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
           <div style={{ height: 140, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <MapPin size={48} style={{ opacity: 0.1 }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 600 }}>Destination Reached?</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Using built-in maps for navigation</div>
              </div>
           </div>
           <div style={{ padding: 16 }}>
             <a 
               href={data.location?.match(/^https?:\/\//) ? data.location : `https://maps.google.com/?q=${encodeURIComponent(data.location || data.address || data.name)}`} 
               target="_blank" rel="noreferrer"
               className="btn btn-secondary" style={{ width: '100%', borderRadius: 10 }}
             >
               <Navigation size={16} /> Open Navigator
             </a>
           </div>
        </div>

        {/* Attendance/Clock Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
           <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                 <Clock size={24} />
              </div>
              <div>
                 <div style={{ fontSize: 14, fontWeight: 700 }}>Attendance Check</div>
                 <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status: {status}</div>
              </div>
           </div>
           
           {appStatus.is_clocked_in === null ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
               <Loader2 className="spinner" size={14} /> Verifying attendance...
             </div>
           ) : appStatus.is_clocked_in === false ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               <div className="alert alert-warning" style={{ fontSize: 11, padding: '8px 10px', borderRadius: 8 }}>
                 <AlertCircle size={14} /> You must clock in to the app first.
               </div>
               <button className="btn btn-secondary" style={{ height: 42, borderRadius: 10 }} onClick={() => navigate('/attendance')}>
                  Go to Attendance
               </button>
             </div>
           ) : (
             <>
               {status === 'Pending' && (
                 <button className="btn btn-primary" style={{ height: 42, borderRadius: 10 }} onClick={handleStart}>
                   <Play size={16} /> Start Trip
                 </button>
               )}
               {status === 'En Route' && (
                 <button className="btn btn-success" style={{ height: 42, borderRadius: 10, background: 'var(--success-500)' }} onClick={handleCheckIn}>
                   <CheckCircle2 size={16} /> Arrived (Check In)
                 </button>
               )}
             </>
           )}


           {(status === 'On Site' || status === 'Completed') && (
             <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8 }}>
                <CheckCircle2 size={14} /> Checked-in at {new Date(session.reached_at).toLocaleTimeString()}
             </div>
           )}
           {status === 'Finished' && (
             <div className="alert alert-info" style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8 }}>
                Session complete. Redirecting...
             </div>
           )}
        </div>
      </div>

      {/* Completion Section */}
      {(status === 'On Site' || status === 'Completed') && (
        <div className="card animate-scale-in" style={{ padding: 24 }}>
           <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Send size={18} color="var(--primary-400)" /> Work Completion Report
           </h3>
           
           <div className="form-group" style={{ marginBottom: 20 }}>
             <label className="form-label" style={{ fontSize: 13 }}>Capture Proof / Media (up to 20)</label>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12, marginTop: 12 }}>
                {photos.map((p, idx) => (
                  <div key={idx} style={{ aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', color: 'white', border: 'none', padding: 2 }} onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}>
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 20 && (
                  <label style={{ 
                    aspectRatio: '1/1', border: '2px dashed var(--border-subtle)', borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-muted)'
                  }}>
                    <Camera size={20} />
                    <span style={{ fontSize: 10, marginTop: 4 }}>Add</span>
                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </label>
                )}
             </div>
           </div>

           <div className="form-group" style={{ marginBottom: 24 }}>
             <label className="form-label" style={{ fontSize: 13 }}>Remarks / Execution Notes</label>
             <textarea 
               className="form-input" 
               rows="4" 
               placeholder="Describe the work done or any issues..."
               value={remarks}
               onChange={(e) => setRemarks(e.target.value)}
             />
           </div>

           <div style={{ display: 'flex', gap: 12 }}>
             {status === 'On Site' && (
               <button 
                 className="btn btn-primary" 
                 style={{ flex: 1, height: 48, borderRadius: 12, fontWeight: 700 }}
                 onClick={handleComplete}
                 disabled={submitting}
               >
                 {submitting ? <Loader2 className="spinner" size={18} /> : <><CheckCircle2 size={18} /> Mark as Complete</>}
               </button>
             )}
             {status === 'Completed' && (
               <button 
                 className="btn btn-secondary" 
                 style={{ flex: 1, height: 48, borderRadius: 12, background: 'var(--surface-3)', color: 'var(--text-primary)', fontWeight: 700 }}
                 onClick={handleCheckOut}
               >
                 <LogOut size={18} /> Check Out & Finish
               </button>
             )}
           </div>
        </div>
      )}

      <style>{`
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
