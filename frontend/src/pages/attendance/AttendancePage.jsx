import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  LogIn, LogOut, MapPin, Navigation, Clock, 
  CheckCircle2, AlertTriangle, ShieldCheck, Map as MapIcon,
  ChevronRight, Calendar, ArrowUpRight, History, Camera, RotateCcw, X,
  Download, Users
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

const GEOFENCE_RADIUS = 500; // 500 meters

export default function AttendancePage() {
  const [isPresent, setIsPresent] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [location, setLocation] = useState([28.6139, 77.2090]); // Default Delhi
  const [isInsideGeofence, setIsInsideGeofence] = useState(true);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);

  // Search/Filter state for reports
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');

  // Selfie verification state
  const [selfieMode, setSelfieMode] = useState('idle'); // idle, camera, captured, verified
  const [selfieImage, setSelfieImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, reportsRes] = await Promise.all([
        api.get('/attendance/'),
        api.get('/reports/overview')
      ]);
      setHistory(historyRes.data || []);
      setReports(reportsRes.data.personnel || []);
      
      // Check for active session
      const active = (historyRes.data || []).find(h => h.status === 'Present' && !h.checkOut);
      if (active) {
        setIsPresent(true);
        setCheckInTime(active.checkIn);
      }
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setSelfieMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
      setSelfieMode('idle');
    }
  }, []);

  const captureSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    // Mirror the image for natural selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setSelfieImage(dataUrl);
    setSelfieMode('captured');
    // Stop the camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const retakeSelfie = useCallback(() => {
    setSelfieImage(null);
    setSelfieMode('idle');
  }, []);

  const verifySelfie = useCallback(() => {
    setVerifying(true);
    // Simulate AI face verification
    setTimeout(() => {
      setVerifying(false);
      setSelfieMode('verified');
    }, 1500);
  }, []);

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/check-in', {
        location: { lat: location[0], lng: location[1] },
        selfie: selfieImage
      });
      setIsPresent(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSelfieMode('idle');
      setSelfieImage(null);
      fetchData(); // Refresh history
    } catch (err) {
      console.error("Check-in failed:", err);
      alert("Check-in failed. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/check-out', {
        location: { lat: location[0], lng: location[1] }
      });
      setIsPresent(false);
      setCheckInTime(null);
      setSelfieMode('idle');
      setSelfieImage(null);
      fetchData(); // Refresh history
    } catch (err) {
      console.error("Check-out failed:", err);
      alert("Check-out failed. Please try again.");
    }
  };

  const filteredReports = (reports || []).filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Attendance & Tracking</h1>
          <p>Register your presence and track location-based work sessions</p>
        </div>
        <div className="status-indicator">
          <div className={`status-dot ${isPresent ? 'active' : ''}`} />
          <span style={{ fontWeight: 600 }}>{isPresent ? 'Currently Active' : 'Not Signed In'}</span>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Work Status</p>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>{isPresent ? 'Clocked In' : 'Clocked Out'}</h2>
            </div>
            <div style={{ 
              width: 48, height: 48, borderRadius: 'var(--radius-lg)', 
              background: isPresent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isPresent ? 'var(--success-400)' : 'var(--primary-400)'
            }}>
              {isPresent ? <CheckCircle2 size={24} /> : <Clock size={24} />}
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {isPresent ? `Since ${checkInTime}` : 'Offline'}
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Privacy Mode
            </label>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Hardware Integrity</p>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>92% <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/ 4G</span></h2>
            </div>
            <div style={{ 
              width: 48, height: 48, borderRadius: 'var(--radius-lg)', 
              background: 'rgba(52, 211, 153, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-400)'
            }}>
              <ShieldCheck size={24} />
            </div>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            Device: iPhone 15 • IP: 192.168.1.45
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Map Area */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 400 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <MapIcon size={18} color="var(--primary-400)" />
              Real-time Location
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Navigation size={12} /> Live polling active
            </span>
          </div>
          <div style={{ height: 'calc(100% - 53px)', width: '100%' }}>
            <MapContainer center={location} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={location}>
                <Popup>
                  Current Location: Near Site SIT-001
                </Popup>
              </Marker>
              <Circle 
                center={location} 
                radius={GEOFENCE_RADIUS} 
                pathOptions={{ color: 'var(--primary-400)', fillColor: 'var(--primary-400)', fillOpacity: 0.15 }} 
              />
            </MapContainer>
          </div>
        </div>

        {/* Action Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', border: isPresent ? '2px solid var(--success-500)' : '2px dashed var(--primary-500)' }}>
            {!isPresent ? (
              <>
                {/* ── SELFIE VERIFICATION SECTION ── */}
                {selfieMode === 'idle' && (
                  <>
                    <Camera size={48} style={{ margin: '0 auto 16px', color: 'var(--primary-400)', opacity: 0.6 }} />
                    <h3 style={{ marginBottom: 8 }}>Identity Verification</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                      Capture a selfie to verify your identity before punching in.
                    </p>
                    <button className="btn btn-primary" onClick={startCamera} style={{ width: '100%', height: 44, fontSize: 14 }}>
                      <Camera size={16} style={{ marginRight: 8 }} /> Open Camera
                    </button>
                    {cameraError && (
                      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--danger-400)', textAlign: 'left' }}>
                        <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {cameraError}
                      </p>
                    )}
                  </>
                )}

                {selfieMode === 'camera' && (
                  <>
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%', borderRadius: 12, border: '2px solid var(--primary-500)',
                          transform: 'scaleX(-1)', background: '#000'
                        }}
                      />
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(239, 68, 68, 0.9)', borderRadius: 20,
                        padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#fff',
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                        LIVE
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <button className="btn btn-secondary" onClick={() => { setSelfieMode('idle'); if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); } }} style={{ flex: 1, height: 40 }}>
                        <X size={14} style={{ marginRight: 4 }} /> Cancel
                      </button>
                      <button className="btn btn-primary" onClick={captureSelfie} style={{ flex: 2, height: 40 }}>
                        <Camera size={14} style={{ marginRight: 4 }} /> Capture Selfie
                      </button>
                    </div>
                  </>
                )}

                {selfieMode === 'captured' && selfieImage && (
                  <>
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                      <img
                        src={selfieImage}
                        alt="Captured selfie"
                        style={{ width: '100%', borderRadius: 12, border: '2px solid var(--warning-400)' }}
                      />
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(245, 158, 11, 0.9)', borderRadius: 20,
                        padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#fff'
                      }}>
                        REVIEW
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <button className="btn btn-secondary" onClick={retakeSelfie} style={{ flex: 1, height: 40 }}>
                        <RotateCcw size={14} style={{ marginRight: 4 }} /> Retake
                      </button>
                      <button className="btn btn-primary" onClick={verifySelfie} disabled={verifying} style={{ flex: 2, height: 40 }}>
                        {verifying ? (
                          <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }} /> Verifying...</>
                        ) : (
                          <><ShieldCheck size={14} style={{ marginRight: 4 }} /> Verify Identity</>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {selfieMode === 'verified' && (
                  <>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.1)', border: '3px solid var(--success-500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px', color: 'var(--success-500)'
                    }}>
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 style={{ marginBottom: 4, color: 'var(--success-400)' }}>Identity Verified ✓</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                      Face matched successfully. You can now punch in.
                    </p>
                    <button className="btn btn-primary" onClick={handleCheckIn} disabled={!isInsideGeofence} style={{ width: '100%', height: 48, fontSize: 16, background: 'var(--success-500)' }}>
                      <LogIn size={18} style={{ marginRight: 8 }} /> Verify & Punch In
                    </button>
                    {!isInsideGeofence && (
                      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--danger-400)' }}>
                        You must be at the site to check in.
                      </p>
                    )}
                  </>
                )}

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </>
            ) : (
              <>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '50%', 
                  background: 'rgba(16, 185, 129, 0.1)', border: '4px solid var(--success-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  color: 'var(--success-500)', animation: 'pulse 2s infinite'
                }}>
                  <Navigation size={32} />
                </div>
                <h3 style={{ marginBottom: 8 }}>Active Session</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                  Your location is being tracked to verify on-site activity.
                </p>
                <button className="btn btn-primary" onClick={handleCheckOut} style={{ width: '100%', height: 48, fontSize: 16, background: 'var(--danger-500)' }}>
                  Punch Out
                </button>
              </>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={18} /> Today's Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Scheduled Shift</span>
                <span>Morning (06:00 - 14:00)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Site Code</span>
                <span>SIT-001</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Grace Period</span>
                <span style={{ color: 'var(--success-400)' }}>Valid</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Selfie Verified</span>
                <span style={{ color: selfieMode === 'verified' || isPresent ? 'var(--success-400)' : 'var(--text-muted)' }}>
                  {selfieMode === 'verified' || isPresent ? '✓ Yes' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Attendance History</h3>
            <button className="btn btn-ghost btn-sm">View Full Calendar <ChevronRight size={14} /></button>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Site</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(history || []).map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.date}</td>
                    <td>{item.checkIn}</td>
                    <td>{item.site}</td>
                    <td>
                      <span className={`badge ${item.status === 'On-Time' || item.status === 'Present' ? 'badge-active' : 'badge-pending'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Personnel Reports ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Personnel Reports</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Individual performance metrics for {selectedMonth}</p>
            </div>
            <button className="btn btn-ghost btn-sm">Export All <Download size={14} /></button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search staff..." 
                style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Users size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
            </div>
            <select 
              className="form-select" 
              style={{ width: 140, height: 36, fontSize: 13 }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option>March 2026</option>
              <option>February 2026</option>
              <option>January 2026</option>
            </select>
          </div>

          <div className="data-table-wrapper" style={{ maxHeight: 280, overflowY: 'auto' }}>
            <table className="data-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface-2)' }}>
                <tr>
                  <th>Employee</th>
                  <th>P / A / L</th>
                  <th>OT (Hrs)</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.dept}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--success-400)' }}>{emp.present}</span> / 
                      <span style={{ color: 'var(--danger-400)' }}> {emp.absent}</span> / 
                      <span style={{ color: 'var(--warning-400)' }}> {emp.late}</span>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{emp.ot}h</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                          <div style={{ 
                            width: emp.rate, height: '100%', 
                            background: parseInt(emp.rate) > 90 ? 'var(--success-500)' : parseInt(emp.rate) > 85 ? 'var(--primary-500)' : 'var(--warning-500)',
                            borderRadius: 2 
                          }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, width: 30 }}>{emp.rate}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
}
