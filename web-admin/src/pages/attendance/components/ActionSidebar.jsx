import React from 'react';
import { Camera, AlertTriangle, X, RotateCcw, ShieldCheck, CheckCircle2, LogIn, Navigation, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActionSidebar({
  activeTab,
  isPresent,
  selfieMode,
  cameraError,
  videoRef,
  canvasRef,
  selfieImage,
  verifying,
  isInsideGeofence,
  liveLocations,
  selectedSession,
  timeline,
  startCamera,
  captureSelfie,
  retakeSelfie,
  verifySelfie,
  handleCheckIn,
  handleCheckOut,
  setSelfieMode,
  streamRef,
  setSelectedSession
}) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {activeTab === 'personal' ? (
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
      ) : (
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Active Personnel ({liveLocations.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
            {liveLocations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface-2)', borderRadius: 16 }}>
                <Users size={32} style={{ opacity: 0.1, marginBottom: 12 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active users currently tracking.</p>
              </div>
            ) : (
              liveLocations.map(emp => (
                <div 
                  key={emp.id} 
                  onClick={() => navigate(`/attendance/timeline/${emp.id}`)}
                  style={{ 
                    padding: '12px 16px', borderRadius: 16, background: 'var(--surface-2)', cursor: 'pointer',
                    border: selectedSession === emp.id ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.2s ease'
                  }}
                  className="monitoring-card"
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'white'
                  }}>
                    {emp.employee_name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{emp.employee_name}</span>
                      <span style={{ 
                        fontSize: 10, fontWeight: 700, color: '#10b981', 
                        background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 10,
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
                        LIVE
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> Since {new Date(emp.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {selectedSession && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Navigation size={14} /> Timeline Activity
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Data Points</span>
                  <span>{timeline.length} signals</span>
                </div>
                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={() => setSelectedSession(null)}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
