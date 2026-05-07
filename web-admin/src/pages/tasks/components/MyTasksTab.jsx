import React from 'react';
import { FileText, PlayCircle, Clock, MapPin, Calendar, Play, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

const PRIORITY_GRADIENTS = {
  high: { bg: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.04) 100%)', accent: '#ef4444', accentBg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  medium: { bg: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.04) 100%)', accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  low: { bg: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', accent: '#10b981', accentBg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
};

const COLUMN_TITLES = {
  'todo': 'Pending',
  'in-progress': 'In Progress',
  'review': 'Under Review',
  'done': 'Completed'
};

export default function MyTasksTab({ 
  myTasks, 
  taskSearch, 
  isEmployee, 
  detailTask, 
  setDetailTask, 
  expandedTaskId, 
  navigate, 
  setSelectedTask, 
  setModalType, 
  setShowModal, 
  handleDeleteTask 
}) {
  const pendingCount = myTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = myTasks.filter(t => t.status === 'in-progress').length;

  return (
    <div className="my-tasks-section">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="var(--primary-400)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{myTasks.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total Tasks</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlayCircle size={22} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{inProgressCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>In Progress</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.02) 100%)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{pendingCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Pending</div>
          </div>
        </div>
      </div>

      {myTasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 80 }}>
          <FileText size={56} style={{ opacity: 0.15, marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {taskSearch ? 'No matching tasks' : 'No Pending Tasks'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {taskSearch ? 'Try a different search term.' : 'You have no pending assignments right now. Great job!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: detailTask ? '1fr 380px' : '1fr', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {myTasks.map(task => {
              const pStyle = PRIORITY_GRADIENTS[task.priority] || PRIORITY_GRADIENTS.medium;
              return (
                <div
                  key={task.id}
                  className="card task-card"
                  style={{
                    padding: 0, overflow: 'hidden', cursor: 'pointer',
                    border: detailTask?.id === task.id ? '1px solid var(--primary-400)' : '1px solid var(--border-subtle)',
                    boxShadow: detailTask?.id === task.id ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                  }}
                  onClick={() => {
                    if (isEmployee) {
                      navigate(`/execution/task/${task.id}`);
                    } else {
                      setDetailTask(detailTask?.id === task.id ? null : task);
                    }
                  }}
                >
                  <div style={{
                    height: 72, background: pStyle.bg, position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    <FileText size={32} style={{ opacity: 0.06 }} />
                    <div style={{
                      position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${pStyle.accent}22 1px, transparent 1px)`, backgroundSize: '18px 18px', opacity: 0.5
                    }} />
                    <div style={{
                      position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5,
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      color: pStyle.accent, textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: pStyle.accent }} />
                      {task.priority}
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: task.status === 'in-progress' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)',
                        color: task.status === 'in-progress' ? '#f59e0b' : '#8b5cf6',
                        border: `1px solid ${task.status === 'in-progress' ? 'rgba(245,158,11,0.25)' : 'rgba(139,92,246,0.25)'}`,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: task.status === 'in-progress' ? '#f59e0b' : '#8b5cf6' }} />
                        {COLUMN_TITLES[task.status]}
                      </span>
                    </div>
                    {task.due_date && (
                      <div style={{
                        position: 'absolute', bottom: 8, left: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                        padding: '3px 10px', borderRadius: 6, fontSize: 10, color: 'rgba(255,255,255,0.85)',
                        fontFamily: 'monospace', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <Calendar size={10} /> Due: {task.due_date}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{
                          background: 'rgba(99,102,241,0.1)', color: 'var(--primary-400)',
                          padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: 'monospace'
                        }}>#{task.id}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>{task.content || task.title}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                      <MapPin size={13} style={{ flexShrink: 0 }} />
                      {task.location ? (
                        <a href={task.location.match(/^https?:\/\//) ? task.location : `https://maps.google.com/?q=${encodeURIComponent(task.location)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline', fontSize: 12 }} onClick={(e) => e.stopPropagation()}>
                          {task.location.length > 30 ? task.location.substring(0, 30) + '...' : task.location}
                        </a>
                      ) : (
                        <span>{task.site_name || task.site || 'No location'}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, fontSize: 12, borderRadius: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEmployee) {
                            navigate(`/execution/task/${task.id}`);
                          } else {
                            setSelectedTask(task); setModalType('complete'); setShowModal(true);
                          }
                        }}
                      >
                        {isEmployee ? (
                          <>{expandedTaskId === task.id ? <Clock size={13} style={{ marginRight: 4 }} /> : <Play size={13} style={{ marginRight: 4 }} />} {expandedTaskId === task.id ? 'Resume Work' : 'Start Workflow'}</>
                        ) : (
                          <><CheckCircle2 size={13} style={{ marginRight: 4 }} /> Mark Complete</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {detailTask && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start', position: 'sticky', top: 24 }}>
              <div style={{
                padding: '24px 24px 20px', background: (PRIORITY_GRADIENTS[detailTask.priority] || PRIORITY_GRADIENTS.medium).bg, borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{
                    background: 'rgba(99,102,241,0.15)', color: 'var(--primary-400)',
                    padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'monospace'
                  }}>#{detailTask.id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                     <span style={{
                       padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                       background: detailTask.status === 'in-progress' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)',
                       color: detailTask.status === 'in-progress' ? '#f59e0b' : '#8b5cf6',
                       border: `1px solid ${detailTask.status === 'in-progress' ? 'rgba(245,158,11,0.25)' : 'rgba(139,92,246,0.25)'}`,
                       display: 'inline-flex', alignItems: 'center', gap: 4,
                     }}>
                       <span style={{ width: 6, height: 6, borderRadius: '50%', background: detailTask.status === 'in-progress' ? '#f59e0b' : '#8b5cf6' }} />
                       {COLUMN_TITLES[detailTask.status]}
                     </span>
                     {!isEmployee && (
                       <>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 6, height: 'auto', background: 'var(--surface-1)' }} onClick={() => { setSelectedTask(detailTask); setModalType('edit'); setShowModal(true); }}>
                          <Edit2 size={14} color="var(--text-primary)" />
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 6, height: 'auto', background: 'var(--surface-1)' }} onClick={() => handleDeleteTask(detailTask)}>
                          <Trash2 size={14} color="var(--danger-400)" />
                        </button>
                       </>
                     )}
                  </div>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{detailTask.content || detailTask.title}</h2>
              </div>

              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Priority Level</div>
                  <div className="card" style={{ background: 'var(--surface-2)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, background: (PRIORITY_GRADIENTS[detailTask.priority] || PRIORITY_GRADIENTS.medium).accentBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', background: (PRIORITY_GRADIENTS[detailTask.priority] || PRIORITY_GRADIENTS.medium).accent,
                        animation: detailTask.priority === 'high' ? 'pulse 2s infinite' : 'none'
                      }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize' }}>{detailTask.priority}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Priority Level</div>
                    </div>
                  </div>
                </div>

                {(detailTask.due_date || detailTask.dueDate) && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Due Date</div>
                    <div className="card" style={{ background: 'var(--surface-2)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Calendar size={18} color="var(--primary-400)" />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{detailTask.due_date || detailTask.dueDate}</span>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Location</div>
                  <div className="card" style={{ background: 'var(--surface-2)', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <MapPin size={14} color="var(--primary-400)" />
                      <span>{detailTask.location || detailTask.site_name || detailTask.site || 'No location set'}</span>
                    </div>
                    {detailTask.location && (
                      <a href={detailTask.location.match(/^https?:\/\//) ? detailTask.location : `https://maps.google.com/?q=${encodeURIComponent(detailTask.location)}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ borderRadius: 8, fontSize: 11 }}>
                        Open Maps
                      </a>
                    )}
                  </div>
                </div>

                {detailTask.description && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Description</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{detailTask.description}</p>
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 8, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600 }}
                  onClick={() => { setSelectedTask(detailTask); setModalType('complete'); setShowModal(true); }}
                >
                  <CheckCircle2 size={18} style={{ marginRight: 8 }} /> Mark as Complete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
