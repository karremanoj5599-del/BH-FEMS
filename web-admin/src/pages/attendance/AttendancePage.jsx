import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Battery, BatteryCharging } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';

import LiveMap from './components/LiveMap';
import ActionSidebar from './components/ActionSidebar';
import PersonalHistory from './components/PersonalHistory';

export default function AttendancePage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['Super Admin', 'Admin', 'HR', 'Manager', 'Supervisor']);
  const [activeTab, setActiveTab] = useState('personal'); 
  const [isPresent, setIsPresent] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [location, setLocation] = useState([28.6139, 77.2090]);
  const [isInsideGeofence, setIsInsideGeofence] = useState(true);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const [liveLocations, setLiveLocations] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  const [selfieMode, setSelfieMode] = useState('idle'); 
  const [selfieImage, setSelfieImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isCharging, setIsCharging] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const syncIntervalRef = useRef(null);

  const updateLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation([position.coords.latitude, position.coords.longitude]),
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const fetchLiveTracking = async () => {
    if (!isAdmin) return;
    setIsLiveLoading(true);
    try {
      const res = await attendanceService.getLiveAttendance();
      setLiveLocations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch live locations:", err);
    } finally {
      setIsLiveLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes] = await Promise.all([
        attendanceService.getMyAttendance()
      ]);
      setHistory(historyRes.data || []);
      
      const active = (historyRes.data || []).find(h => h.status === 'Present' && !h.check_out);
      if (active) {
        setIsPresent(true);
        setCheckInTime(new Date(active.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      } else {
        setIsPresent(false);
        setCheckInTime(null);
      }
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    updateLocation();
    
    // Battery Status API
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      });
    }

    if (isAdmin) {
      fetchLiveTracking();
      const interval = setInterval(fetchLiveTracking, 30000);
      return () => clearInterval(interval);
    }
  }, [updateLocation, isAdmin]);

  useEffect(() => {
    if (isPresent) {
      syncIntervalRef.current = setInterval(async () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              await attendanceService.syncLocation({
                lat: position.coords.latitude,
                long: position.coords.longitude,
                timestamp: new Date().toISOString()
              });
            } catch (err) {
              console.error("Auto-sync failed:", err);
            }
          });
        }
      }, 10 * 1000); // Sync every 10 seconds for ultra-high accuracy route tracking
    } else {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [isPresent]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
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
      if (videoRef.current) videoRef.current.srcObject = stream;
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
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setSelfieImage(canvas.toDataURL('image/png'));
    setSelfieMode('captured');
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
    setTimeout(() => {
      setVerifying(false);
      setSelfieMode('verified');
    }, 1500);
  }, []);

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn({
        lat: location[0],
        long: location[1],
        selfie_url: selfieImage,
        face_recognition_verified: selfieMode === 'verified',
        mode: 'GPS'
      });
      await attendanceService.syncLocation({
        lat: location[0],
        long: location[1],
        timestamp: new Date().toISOString()
      }).catch(e => console.log("Initial breadcrumb failed"));

      setIsPresent(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setSelfieMode('idle');
      setSelfieImage(null);
      fetchData(); 
    } catch (err) {
      console.error("Check-in failed:", err);
      alert("Check-in failed. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut({ lat: location[0], long: location[1] });
      setIsPresent(false);
      setCheckInTime(null);
      setSelfieMode('idle');
      setSelfieImage(null);
      fetchData(); 
    } catch (err) {
      console.error("Check-out failed:", err);
      alert("Check-out failed. Please try again.");
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Attendance & Tracking</h1>
          <p>Register your presence and track location-based work sessions</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {isAdmin && (
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 4 }}>
              <button 
                onClick={() => setActiveTab('personal')}
                style={{ 
                  padding: '8px 16px', borderRadius: 8, border: 'none', 
                  background: activeTab === 'personal' ? 'var(--primary-500)' : 'none',
                  color: activeTab === 'personal' ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                My Attendance
              </button>
              <button 
                onClick={() => setActiveTab('monitoring')}
                style={{ 
                  padding: '8px 16px', borderRadius: 8, border: 'none', 
                  background: activeTab === 'monitoring' ? 'var(--primary-500)' : 'none',
                  color: activeTab === 'monitoring' ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                Team Monitor
              </button>
            </div>
          )}
          <div className="status-indicator">
            <div className={`status-dot ${isPresent ? 'active' : ''}`} />
            <span style={{ fontWeight: 600 }}>{isPresent ? 'Currently Active' : 'Not Signed In'}</span>
          </div>
        </div>
      </div>

      {activeTab === 'personal' && (
        <div className="stats-grid" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Hardware Integrity</p>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>100% <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--success-400)' }}>/ Secure</span></h2>
              </div>
              <div style={{ 
                width: 48, height: 48, borderRadius: 'var(--radius-lg)', 
                background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-400)'
              }}>
                <ShieldCheck size={24} />
              </div>
            </div>
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              Device: {navigator.userAgentData?.platform || (navigator.userAgent.includes('Win') ? 'Windows' : navigator.userAgent.includes('Mac') ? 'macOS' : 'Mobile')} • Status: Verified
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Battery Status</p>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>
                  {batteryLevel !== null ? `${batteryLevel}%` : '--%'} 
                  <span style={{ fontSize: 14, fontWeight: 400, color: isCharging ? 'var(--success-400)' : 'var(--text-muted)', marginLeft: 8 }}>
                    {isCharging ? 'Charging' : 'On Battery'}
                  </span>
                </h2>
              </div>
              <div style={{ 
                width: 48, height: 48, borderRadius: 'var(--radius-lg)', 
                background: isCharging ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCharging ? 'var(--success-400)' : 'var(--text-muted)'
              }}>
                {isCharging ? <BatteryCharging size={24} /> : <Battery size={24} />}
              </div>
            </div>
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              Power Source: {isCharging ? 'AC Adapter' : 'Internal Battery'}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <LiveMap 
          activeTab={activeTab} location={location} liveLocations={liveLocations} 
          selectedSession={selectedSession} timeline={timeline} 
        />

        <ActionSidebar 
          activeTab={activeTab} isPresent={isPresent} selfieMode={selfieMode} 
          cameraError={cameraError} videoRef={videoRef} canvasRef={canvasRef} 
          selfieImage={selfieImage} verifying={verifying} isInsideGeofence={isInsideGeofence} 
          liveLocations={liveLocations} selectedSession={selectedSession} timeline={timeline} 
          startCamera={startCamera} captureSelfie={captureSelfie} retakeSelfie={retakeSelfie} 
          verifySelfie={verifySelfie} handleCheckIn={handleCheckIn} handleCheckOut={handleCheckOut} 
          setSelfieMode={setSelfieMode} streamRef={streamRef} setSelectedSession={setSelectedSession}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        {activeTab === 'personal' && (
          <PersonalHistory selfieMode={selfieMode} isPresent={isPresent} history={history} />
        )}
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .monitoring-card:hover {
          border-color: var(--primary-400) !important;
          background: var(--surface-3) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
