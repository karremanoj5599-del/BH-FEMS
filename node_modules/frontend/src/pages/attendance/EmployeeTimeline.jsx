import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  ArrowLeft, MapPin, Clock, Calendar, 
  User, Building2, Navigation, Activity,
  ChevronRight, Map as MapIcon, ShieldCheck,
  LogIn, LogOut, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function EmployeeTimeline() {
  const { attendanceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailRes, timelineRes] = await Promise.all([
          api.get(`/attendance/${attendanceId}`),
          api.get(`/attendance/${attendanceId}/timeline`)
        ]);
        setDetails(detailRes.data);
        setTimeline(timelineRes.data || []);
      } catch (err) {
        console.error("Failed to fetch timeline data:", err);
        setError("Could not load timeline. It may have been deleted or doesn't exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attendanceId]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (error) return (
    <div className="card" style={{ maxWidth: 500, margin: '100px auto', textAlign: 'center', padding: 40 }}>
      <Activity size={48} color="var(--danger-400)" style={{ marginBottom: 16 }} />
      <h3>Error Loading Timeline</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
      <button className="btn btn-primary" onClick={() => navigate('/attendance')}>Back to Attendance</button>
    </div>
  );

  const startPos = [details.lat, details.long];
  const endPos = [details.latest_lat, details.latest_long];
  const path = timeline.map(t => [t.lat, t.long]);

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/attendance')} style={{ padding: 8 }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Employee Movement Timeline</h1>
            <p>Detailed tracking path for {details.employee_name} • Session #{attendanceId}</p>
          </div>
        </div>
        <div className="status-indicator">
          <div className={`status-dot ${!details.check_out ? 'active' : ''}`} />
          <span style={{ fontWeight: 600 }}>{details.check_out ? 'Session Completed' : 'Live Tracking Active'}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 24, minHeight: 0 }}>
        {/* Map Area */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
           <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 8 }}>
              <div style={{ background: 'var(--surface-1)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
                Path: {timeline.length} signals captured
              </div>
           </div>
           
           <MapContainer center={endPos} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Start Point */}
              <Marker position={startPos}>
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <strong>Start Point</strong><br/>
                    {new Date(details.check_in).toLocaleString()}
                  </div>
                </Popup>
              </Marker>

              {/* Path */}
              {path.length > 1 && (
                <Polyline positions={path} pathOptions={{ color: 'var(--primary-400)', weight: 4, opacity: 0.8, dashArray: '10, 10' }} stroke />
              )}

              {/* Current/End Point */}
              <Marker position={endPos}>
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <strong>{details.check_out ? 'End Point' : 'Current Location'}</strong><br/>
                    {details.check_out ? new Date(details.check_out).toLocaleString() : 'Live'}
                  </div>
                </Popup>
              </Marker>
              
              {/* Breadcrumbs */}
              {timeline.map((point, idx) => (
                <Circle 
                  key={point.id} 
                  center={[point.lat, point.long]} 
                  radius={5} 
                  pathOptions={{ color: 'var(--primary-400)', fillColor: 'var(--primary-400)', fillOpacity: 0.5 }}
                />
              ))}
           </MapContainer>
        </div>

        {/* Sidebar Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
            {/* Employee Card */}
            <div className="card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <User size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{details.employee_name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{details.department} Department</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Started</span>
                  <span>{new Date(details.check_in).toLocaleTimeString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> Ended</span>
                  <span>{details.check_out ? new Date(details.check_out).toLocaleTimeString() : 'In Progress'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> Mode</span>
                  <span className="badge badge-active">{details.mode}</span>
                </div>
              </div>
            </div>

            {/* Signal Log */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Navigation size={18} color="var(--primary-400)" /> Movement Log
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Check-in entry */}
                    <TimelineItem 
                      icon={<LogIn size={14} />} 
                      title="Shift Started (Check-in)" 
                      time={new Date(details.check_in).toLocaleTimeString()} 
                      desc={`At coordinates [${details.lat.toFixed(4)}, ${details.long.toFixed(4)}]`}
                      isFirst
                    />

                    {/* Breadcrumbs */}
                    {timeline.map((point, i) => (
                      <TimelineItem 
                        key={point.id}
                        icon={<Activity size={14} />} 
                        title="Location Signal" 
                        time={new Date(point.timestamp).toLocaleTimeString()} 
                        desc={`Roaming update from ${point.network || 'GPS'}`}
                      />
                    ))}

                    {/* Check-out entry if exists */}
                    {details.check_out && (
                      <TimelineItem 
                        icon={<LogOut size={14} />} 
                        title="Shift Ended (Check-out)" 
                        time={new Date(details.check_out).toLocaleTimeString()} 
                        desc="Session closed by user"
                        isLast
                      />
                    )}
                    
                    {!details.check_out && (
                       <TimelineItem 
                        icon={<RefreshCw size={14} className="animate-spin" />} 
                        title="Tracking Active" 
                        time="Live" 
                        desc="Waiting for next signal..."
                        isLast
                        isPending
                      />
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon, title, time, desc, isFirst, isLast, isPending }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: isLast ? 0 : 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: '50%', 
          background: isPending ? 'rgba(99,102,241,0.1)' : 'var(--surface-3)', 
          border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: isPending ? 'var(--primary-400)' : 'var(--text-secondary)',
          zIndex: 1
        }}>
          {icon}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600 }}>{title}</h4>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{time}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </div>
  );
}


