import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  ArrowLeft, MapPin, Clock, Calendar, Briefcase, 
  CheckCircle2, Camera, User, FileText, Activity, 
  ExternalLink, Navigation, Map as MapIcon
} from 'lucide-react';
import api from '../../services/api';

// Fix Leaflet default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icons for check-in/out
const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
const orangeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function openGoogleMaps(lat, long) {
  window.open(`https://www.google.com/maps?q=${lat},${long}`, '_blank');
}

function LocationLink({ lat, long, label }) {
  if (!lat || !long) return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Location not available</span>;
  return (
    <button
      onClick={() => openGoogleMaps(lat, long)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)',
        color: 'var(--primary-400)', borderRadius: 6, padding: '4px 10px',
        cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
      title="Open in Google Maps"
    >
      <MapPin size={13} />
      {label || `${lat.toFixed(4)}, ${long.toFixed(4)}`}
      <ExternalLink size={11} />
    </button>
  );
}

export default function EmployeeDailyReport() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/reports/employee/${id}/daily?date=${dateStr}`);
        setReport(res.data);
      } catch (err) {
        console.error("Failed to fetch employee daily report:", err);
        setError("Failed to load details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id, dateStr]);

  // Build map data from timeline
  const mapData = useMemo(() => {
    if (!report || !report.timeline) return { points: [], path: [], center: null };
    
    const points = report.timeline
      .filter(e => e.lat != null && e.long != null)
      .map((e, idx) => ({ ...e, idx }));
    
    const path = points.map(p => [p.lat, p.long]);
    
    // Center on check-in location, or first available point, or a default
    let center = null;
    if (report.checkInLocation) {
      center = [report.checkInLocation.lat, report.checkInLocation.long];
    } else if (points.length > 0) {
      center = [points[0].lat, points[0].long];
    }
    
    return { points, path, center };
  }, [report]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (error) return <div style={{ padding: 24, color: 'var(--danger-400)' }}>{error}</div>;
  if (!report) return null;

  const getMarkerIcon = (type) => {
    switch(type) {
      case 'check-in': return greenIcon;
      case 'check-out': return redIcon;
      case 'site-in':
      case 'site-out': return orangeIcon;
      default: return DefaultIcon;
    }
  };

  const getTimelineDotColor = (type) => {
    switch(type) {
      case 'check-in': return 'var(--success-400)';
      case 'check-out': return 'var(--danger-400)';
      case 'site-in': return 'var(--primary-400)';
      case 'site-out': return 'var(--warning-400)';
      case 'task-update': return '#a78bfa';
      case 'location': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost" 
          style={{ padding: 8, height: 'auto' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {report.employeeName} 
            <span className={`badge ${report.status === 'Present' || report.status === 'On-Time' ? 'badge-active' : 'badge-danger'}`}>
              {report.status}
            </span>
          </h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span><Briefcase size={14} style={{ display: 'inline', marginRight: 4 }}/> {report.employeeCode}</span>
            <span><User size={14} style={{ display: 'inline', marginRight: 4 }}/> {report.department}</span>
            <span><Calendar size={14} style={{ display: 'inline', marginRight: 4 }}/> {new Date(dateStr).toLocaleDateString()}</span>
            <span><Clock size={14} style={{ display: 'inline', marginRight: 4 }}/> OT: {report.ot}</span>
          </p>
        </div>
      </div>

      {/* Check-In / Check-Out Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Check-in Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 color="var(--success-400)" size={18} /> Check In
            </h3>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{report.checkInTime || '--:--'}</span>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            {report.checkInPhoto ? (
              <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--surface-2)', flexShrink: 0 }}>
                <img src={report.checkInPhoto} alt="Check In Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Camera size={24} />
              </div>
            )}
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} /> Location
              </p>
              {report.checkInLocation ? (
                <LocationLink lat={report.checkInLocation.lat} long={report.checkInLocation.long} />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Location not available</span>
              )}
            </div>
          </div>
        </div>

        {/* Check-out Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock color="var(--warning-400)" size={18} /> Check Out
            </h3>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{report.checkOutTime || '--:--'}</span>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
             {report.checkOutPhoto ? (
              <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--surface-2)', flexShrink: 0 }}>
                <img src={report.checkOutPhoto} alt="Check Out Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Camera size={24} />
              </div>
            )}
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} /> Location
              </p>
              {report.checkOutLocation ? (
                <LocationLink lat={report.checkOutLocation.lat} long={report.checkOutLocation.long} />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Location not available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map + Timeline Row */}
      {mapData.center && (
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <MapIcon size={18} /> Movement Map
            </h3>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success-400)', display: 'inline-block' }}/>
                Check In
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316', display: 'inline-block' }}/>
                Sites
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-400)', display: 'inline-block' }}/>
                Locations
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger-400)', display: 'inline-block' }}/>
                Check Out
              </span>
            </div>
          </div>
          <div style={{ height: 400 }}>
            <MapContainer 
              center={mapData.center} 
              zoom={14} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Route polyline */}
              {mapData.path.length > 1 && (
                <Polyline 
                  positions={mapData.path} 
                  pathOptions={{ 
                    color: '#6366f1', 
                    weight: 4, 
                    opacity: 0.8, 
                    dashArray: '8, 12',
                    lineCap: 'round'
                  }} 
                />
              )}
              
              {/* Markers for each location event */}
              {mapData.points.map((point, idx) => (
                <React.Fragment key={idx}>
                  <Marker position={[point.lat, point.long]} icon={getMarkerIcon(point.type)}>
                    <Popup>
                      <div style={{ fontSize: 13, minWidth: 150 }}>
                        <strong>{point.title}</strong><br/>
                        <span style={{ color: '#666' }}>{point.time}</span><br/>
                        <span style={{ color: '#888', fontSize: 12 }}>{point.description}</span><br/>
                        <a 
                          href={`https://www.google.com/maps?q=${point.lat},${point.long}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ fontSize: 12, color: '#6366f1' }}
                        >
                          Open in Google Maps ↗
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                  {/* Small circle breadcrumbs for location pings */}
                  {point.type === 'location' && (
                    <Circle
                      center={[point.lat, point.long]}
                      radius={15}
                      pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.4 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Timeline + Sites/Tasks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24 }}>
        {/* Timeline */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} /> Daily Timeline
          </h3>
          <div style={{ position: 'relative', paddingLeft: 20, borderLeft: '2px solid var(--border-subtle)' }}>
            {report.timeline && report.timeline.length > 0 ? report.timeline.map((event, idx) => (
              <div key={idx} style={{ marginBottom: 24, position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', left: -26, top: 4, width: 10, height: 10, borderRadius: '50%', 
                  background: getTimelineDotColor(event.type),
                  border: '2px solid var(--surface-1)'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{event.title}</h4>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{event.time}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, marginBottom: 4 }}>{event.description}</p>
                {event.lat != null && event.long != null && (
                  <LocationLink lat={event.lat} long={event.long} />
                )}
              </div>
            )) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No activities recorded for this day.</p>
            )}
          </div>
        </div>

        <div>
          {/* Sites Visited */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} /> Sites Visited
            </h3>
            {report.sitesVisited && report.sitesVisited.length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Site Name</th>
                      <th>Arrived</th>
                      <th>Left</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.sitesVisited.map((site) => (
                      <tr key={site.id}>
                        <td>
                          <span className={`badge ${site.status.toLowerCase() === 'completed' ? 'badge-active' : 'badge-pending'}`}>
                            {site.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{site.siteName}</td>
                        <td>{site.checkIn || '-'}</td>
                        <td>{site.checkOut || '-'}</td>
                        <td>
                          {site.lat && site.long ? (
                            <LocationLink lat={site.lat} long={site.long} label="View" />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No sites visited.</p>
            )}
          </div>

          {/* Tasks Visited */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} /> Tasks Handled
            </h3>
            {report.tasksVisited && report.tasksVisited.length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Task Title</th>
                      <th>Progress Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.tasksVisited.map((task, idx) => (
                      <tr key={idx}>
                        <td>{task.updatedTime}</td>
                        <td style={{ fontWeight: 500 }}>{task.taskTitle}</td>
                        <td>{task.progress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tasks updated today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
