import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, MapPin, CheckCircle2, LogOut, Camera,
  Clock, Navigation, Loader2, AlertCircle, X,
  ChevronDown, ChevronUp, Image as ImageIcon, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STEPS = [
  { key: 'started', label: 'Start Journey', icon: Play, color: '#6366f1' },
  { key: 'reached', label: 'Reached Site', icon: MapPin, color: '#f59e0b' },
  { key: 'completed', label: 'Complete Work', icon: CheckCircle2, color: '#10b981' },
  { key: 'checked_out', label: 'Check Out', icon: LogOut, color: '#8b5cf6' },
];

const STATUS_TO_STEP = {
  'Pending': -1,
  'Not Started': -1,
  'En Route': 0,
  'On Site': 1,
  'Completed': 2,
  'Finished': 3,
};

export default function ExecutionTracker({ targetType, targetId, targetData, onComplete, onClose }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [clockedIn, setClockedIn] = useState(null); // null = loading
  const [photos, setPhotos] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkStatus();
    if (targetType === 'site') {
      fetchTasks();
    }
  }, [targetType, targetId]);

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await api.get(`/tasks/?site_id=${targetId}&assigned_to=${user?.id}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks for tracker:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await api.get('/attendance/site/active-sessions');
      setClockedIn(res.data.is_clocked_in);
      
      // Find active session for this specific target
      const sessions = res.data.sessions || [];
      const match = sessions.find(s => {
        if (targetType === 'site') return s.site_id === parseInt(targetId);
        if (targetType === 'task') return s.task_id === parseInt(targetId);
        return false;
      });
      if (match) setSession(match);
    } catch (err) {
      // Fallback: try the status endpoint
      try {
        const res = await api.get('/attendance/status');
        setClockedIn(res.data.is_clocked_in);
        if (res.data.site_session) {
          const ss = res.data.site_session;
          const isMatch = targetType === 'site'
            ? ss.site_id === parseInt(targetId)
            : ss.task_id === parseInt(targetId);
          if (isMatch) setSession(ss);
        }
      } catch {
        setClockedIn(false);
      }
    }
  };

  const handleStart = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        site_id: targetType === 'site' ? targetId : (targetData?.site_id || null),
        task_id: targetType === 'task' ? targetId : null,
      };
      const res = await api.post('/attendance/site/start', null, { params: payload });
      setSession(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to start journey';
      setError(typeof msg === 'string' ? msg : 'Failed to start. Please check your attendance status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReached = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post(`/attendance/site/${session.id}/check-in`);
      setSession(res.data);
    } catch (err) {
      setError('Failed to mark as reached');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!remarks.trim()) {
      setError('Please add remarks describing the work done before completing.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        notes: remarks,
        photos: JSON.stringify(photos),
      };
      const res = await api.post(`/attendance/site/${session.id}/complete`, null, { params: payload });
      setSession(res.data);
    } catch (err) {
      setError('Failed to submit completion report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/attendance/site/${session.id}/check-out`);
      setSession(prev => ({ ...prev, status: 'Finished' }));
      if (onComplete) onComplete();
    } catch (err) {
      setError('Failed to check out');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 20) {
      setError('Maximum 20 photos allowed.');
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const currentStatus = session?.status || 'Pending';
  const currentStepIdx = STATUS_TO_STEP[currentStatus] ?? -1;

  const formatTime = (iso) => {
    if (!iso) return '--';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getElapsed = (start, end) => {
    if (!start) return '';
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const diff = Math.floor((e - s) / 1000);
    const m = Math.floor(diff / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${diff % 60}s`;
  };

  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      overflow: 'hidden',
      animation: 'trackerSlideIn 0.3s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-400)', marginBottom: 4 }}>
            Execution Tracker
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {targetData?.name || targetData?.title || `${targetType} #${targetId}`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: currentStepIdx >= 3 ? 'rgba(16,185,129,0.12)' : currentStepIdx >= 0 ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)',
            color: currentStepIdx >= 3 ? '#10b981' : currentStepIdx >= 0 ? '#f59e0b' : '#8b5cf6',
          }}>
            {currentStatus}
          </span>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4,
            }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Timeline Steps */}
      <div style={{ padding: '20px' }}>
        {/* Not clocked in warning */}
        {clockedIn === false && currentStepIdx < 0 && (
          <div style={{
            display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12, marginBottom: 16,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Daily Attendance Required</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                You must clock in via the <strong>Attendance</strong> page before starting any site work.
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#ef4444',
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* Step-by-step timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, idx) => {
            const isDone = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx - 1 || (idx === 0 && currentStepIdx < 0);
            const StepIcon = step.icon;

            return (
              <div key={step.key} style={{ display: 'flex', gap: 16 }}>
                {/* Vertical line + circle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: isDone ? step.color : 'var(--surface-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: isDone ? `0 0 12px ${step.color}40` : 'none',
                  }}>
                    {isDone ? (
                      <CheckCircle2 size={16} color="white" />
                    ) : (
                      <StepIcon size={14} color="var(--text-muted)" />
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 24,
                      background: isDone ? step.color : 'var(--border-subtle)',
                      transition: 'background 0.3s ease',
                    }} />
                  )}
                </div>

                {/* Step content */}
                <div style={{ flex: 1, paddingBottom: idx < STEPS.length - 1 ? 16 : 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                    marginBottom: 4,
                  }}>
                    {step.label}
                  </div>

                  {/* Timestamps for done steps */}
                  {isDone && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                      {step.key === 'started' && session?.start_time && (
                        <>
                          <span>⏱ {formatTime(session.start_time)}</span>
                          {session.reached_at && <span style={{ color: '#10b981' }}>Travel: {getElapsed(session.start_time, session.reached_at)}</span>}
                        </>
                      )}
                      {step.key === 'reached' && session?.reached_at && (
                        <span>📍 {formatTime(session.reached_at)}</span>
                      )}
                      {step.key === 'completed' && (
                        <span>✅ Work done{session?.notes ? ` — "${session.notes.substring(0, 40)}..."` : ''}</span>
                      )}
                      {step.key === 'checked_out' && session?.check_out && (
                        <>
                          <span>🏁 {formatTime(session.check_out)}</span>
                          <span style={{ color: '#10b981' }}>Total: {getElapsed(session.start_time, session.check_out)}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* --- Action areas for current step --- */}

                  {/* Step 1: Start button */}
                  {idx === 0 && currentStepIdx < 0 && clockedIn !== false && (
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: 8, height: 40, borderRadius: 10, fontSize: 13, fontWeight: 600, gap: 8 }}
                      onClick={handleStart}
                      disabled={submitting || clockedIn === null}
                    >
                      {submitting ? <Loader2 className="spinner" size={14} /> : <Play size={14} />}
                      {clockedIn === null ? 'Checking status...' : 'Start Clock In'}
                    </button>
                  )}

                  {/* Step 2: Reached button */}
                  {idx === 1 && currentStepIdx === 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} /> Traveling... {getElapsed(session?.start_time)}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn"
                          style={{
                            height: 40, borderRadius: 10, fontSize: 13, fontWeight: 600, gap: 8,
                            background: '#f59e0b', color: 'white', border: 'none',
                          }}
                          onClick={handleReached}
                          disabled={submitting}
                        >
                          {submitting ? <Loader2 className="spinner" size={14} /> : <MapPin size={14} />}
                          Reached Site
                        </button>
                        {targetData?.lat && targetData?.long && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${targetData.lat},${targetData.long}`}
                            target="_blank" rel="noreferrer"
                            className="btn btn-ghost"
                            style={{ height: 40, borderRadius: 10, fontSize: 12, gap: 6 }}
                          >
                            <Navigation size={13} /> Navigate
                          </a>
                        )}
                      </div>
                      
                      {/* Site Tasks Section - Visible when reached site */}
                      {targetType === 'site' && tasks.length > 0 && (
                        <div style={{ 
                          marginTop: 12, 
                          padding: '12px 14px', 
                          background: 'rgba(99,102,241,0.04)', 
                          borderRadius: 12, 
                          border: '1px dashed rgba(99,102,241,0.15)' 
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-400)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                             <ClipboardList size={12} /> Work to Perform ({tasks.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {tasks.map(t => (
                              <div 
                                key={t.id} 
                                className="tracker-task-item"
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 10,
                                  cursor: 'pointer',
                                  padding: '4px 6px',
                                  borderRadius: 8,
                                  transition: 'all 0.2s ease',
                                }}
                                onClick={() => navigate('/tasks', { state: { openTaskId: t.id } })}
                              >
                                <div style={{ 
                                  width: 18, height: 18, borderRadius: '50%', 
                                  background: t.status === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {t.status === 'done' ? <CheckCircle2 size={10} color="#10b981" /> : <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b' }} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ 
                                    fontSize: 12, fontWeight: 600, 
                                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                                    color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                  }}>
                                    {t.title || t.content}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {t.priority && t.status !== 'done' && (
                                      <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
                                        {t.priority} Priority
                                      </div>
                                    )}
                                    <div style={{ fontSize: 9, color: 'var(--primary-400)', fontWeight: 600, opacity: 0 }}>
                                      View Details →
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Complete — photo upload + remarks */}
                  {idx === 2 && currentStepIdx === 1 && (
                    <div style={{ marginTop: 12 }}>
                      {/* Photo upload */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                          Upload Proof Photos (up to 20)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 8 }}>
                          {photos.map((p, idx) => (
                            <div key={idx} style={{
                              aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden',
                              border: '1px solid var(--border-subtle)', position: 'relative',
                            }}>
                              <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                                style={{
                                  position: 'absolute', top: 2, right: 2,
                                  background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
                                  color: 'white', border: 'none', padding: 2, cursor: 'pointer',
                                  width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          {photos.length < 20 && (
                            <label style={{
                              aspectRatio: '1/1', border: '2px dashed var(--border-subtle)', borderRadius: 8,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10,
                            }}>
                              <Camera size={16} />
                              <span style={{ marginTop: 2 }}>Add</span>
                              <input
                                ref={fileInputRef}
                                type="file" multiple accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Remarks */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Work Remarks <span style={{ color: '#ef4444' }}>*</span>
                        </div>
                        <textarea
                          className="form-input"
                          rows="3"
                          placeholder="Describe the work completed, issues found, etc..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          style={{ fontSize: 13, borderRadius: 10 }}
                        />
                      </div>

                      <button
                        className="btn"
                        style={{
                          width: '100%', height: 42, borderRadius: 10, fontSize: 13, fontWeight: 700, gap: 8,
                          background: '#10b981', color: 'white', border: 'none',
                        }}
                        onClick={handleComplete}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="spinner" size={14} /> : <CheckCircle2 size={14} />}
                        Complete & Submit Report
                      </button>
                    </div>
                  )}

                  {/* Step 4: Check Out */}
                  {idx === 3 && currentStepIdx === 2 && (
                    <button
                      className="btn"
                      style={{
                        marginTop: 8, height: 42, borderRadius: 10, fontSize: 13, fontWeight: 700, gap: 8,
                        background: '#8b5cf6', color: 'white', border: 'none',
                      }}
                      onClick={handleCheckOut}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="spinner" size={14} /> : <LogOut size={14} />}
                      Check Out & Leave
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Finished summary */}
        {currentStepIdx >= 3 && (
          <div style={{
            marginTop: 16, padding: '14px 16px', borderRadius: 12,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            textAlign: 'center',
          }}>
            <CheckCircle2 size={24} color="#10b981" style={{ marginBottom: 6 }} />
            <div style={{ fontWeight: 700, fontSize: 14, color: '#10b981' }}>Execution Complete!</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Total time: {getElapsed(session?.start_time, session?.check_out)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes trackerSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tracker-task-item:hover {
          background: rgba(99,102,241,0.08) !important;
          transform: translateX(4px);
        }
        .tracker-task-item:hover div[style*="opacity: 0"] {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
