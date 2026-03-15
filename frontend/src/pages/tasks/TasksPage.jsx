import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Plus, MoreVertical, Calendar, User, MapPin, X, 
  CheckCircle2, Clock, PlayCircle, FileText, 
  Image as ImageIcon, Video, Search, Filter 
} from 'lucide-react';

const ITEM_TYPES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done'
};

const PRIORITY_COLORS = {
  high: 'var(--danger-400)',
  medium: 'var(--warning-400)',
  low: 'var(--success-400)'
};

const COLUMN_TITLES = {
  [ITEM_TYPES.TODO]: 'Pending',
  [ITEM_TYPES.IN_PROGRESS]: 'In Progress',
  [ITEM_TYPES.REVIEW]: 'Under Review',
  [ITEM_TYPES.DONE]: 'Completed'
};

const COLUMN_ICONS = {
  [ITEM_TYPES.TODO]: <Clock size={16} />,
  [ITEM_TYPES.IN_PROGRESS]: <PlayCircle size={16} />,
  [ITEM_TYPES.REVIEW]: <CheckCircle2 size={16} />,
  [ITEM_TYPES.DONE]: <CheckCircle2 size={16} color="var(--success-400)" />
};

export default function TasksPage() {
  const { isEmployeeView, user } = useAuth();
  const isEmployee = isEmployeeView('tasks');
  const [activeTab, setActiveTab] = useState(isEmployee ? 'myTasks' : 'board'); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const cols = {
      [ITEM_TYPES.TODO]: tasks.filter(t => t.status === 'todo'),
      [ITEM_TYPES.IN_PROGRESS]: tasks.filter(t => t.status === 'in-progress'),
      [ITEM_TYPES.REVIEW]: tasks.filter(t => t.status === 'review'),
      [ITEM_TYPES.DONE]: tasks.filter(t => t.status === 'done')
    };
    setColumns(cols);
  }, [tasks]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      try {
        await api.patch(`/tasks/${draggableId}`, { status: destination.droppableId });
        setTasks(prev => prev.map(t => 
          t.id.toString() === draggableId.toString() ? { ...t, status: destination.droppableId } : t
        ));
      } catch (err) {
        console.error("Failed to update task status:", err);
        alert("Failed to update status. Please try again.");
      }
    }
  };

  const myTasks = tasks.filter(t => (t.assignee_id === user?.id || t.assignee === user?.name) && t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'review');

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const notes = formData.get('notes');
    
    try {
      await api.patch(`/tasks/${selectedTask.id}`, { status: 'review', notes });
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id ? { ...t, status: 'review', notes } : t
      ));
      setShowModal(false);
      setSelectedTask(null);
    } catch (err) {
      alert("Failed to update task. Please try again.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1>Task & Work Order Management</h1>
          <p>Kanban board, personal assignments, and field execution reports.</p>
        </div>
        {!isEmployee && (
          <button className="btn btn-primary" onClick={() => { setModalType('create'); setShowModal(true); }}>
            <Plus size={16} /> Create Task
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 1 }}>
        <button
          className={`nav-item ${activeTab === 'myTasks' ? 'active' : ''}`}
          style={{ borderRadius: '12px 12px 0 0', padding: '12px 20px', borderBottom: activeTab === 'myTasks' ? '3px solid var(--primary-400)' : '3px solid transparent' }}
          onClick={() => setActiveTab('myTasks')}
        >
          <User size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> My Tasks
        </button>
        {!isEmployee && (
          <>
            <button
              className={`nav-item ${activeTab === 'board' ? 'active' : ''}`}
              style={{ borderRadius: '12px 12px 0 0', padding: '12px 20px', borderBottom: activeTab === 'board' ? '3px solid var(--primary-400)' : '3px solid transparent' }}
              onClick={() => setActiveTab('board')}
            >
              <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Team Kanban Board
            </button>
            <button
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              style={{ borderRadius: '12px 12px 0 0', padding: '12px 20px', borderBottom: activeTab === 'reports' ? '3px solid var(--primary-400)' : '3px solid transparent' }}
              onClick={() => setActiveTab('reports')}
            >
              <FileText size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Task Reports
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ flex: 1 }}><div className="spinner" /></div>
      ) : (
        <>
          {activeTab === 'board' && (
            <div style={{ display: 'flex', gap: 20, overflowX: 'auto', flex: 1, paddingBottom: 16 }}>
              <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(columns).map(([columnId, items]) => (
                  <div key={columnId} className="kanban-column" style={{ minWidth: 320, maxWidth: 320, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {COLUMN_ICONS[columnId]}
                        {COLUMN_TITLES[columnId]}
                        <span style={{ background: 'var(--surface-3)', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                          {items?.length || 0}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{
                            background: snapshot.isDraggingOver ? 'var(--surface-2)' : 'var(--surface-1)',
                            padding: 12,
                            borderRadius: 'var(--radius-lg)',
                            flex: 1,
                            overflowY: 'auto',
                            border: '1px solid var(--border-subtle)',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          {items?.map((item, index) => (
                            <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="card kanban-card"
                                  style={{
                                    ...provided.draggableProps.style,
                                    padding: 16,
                                    marginBottom: 12,
                                    border: snapshot.isDragging ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                                    boxShadow: snapshot.isDragging ? '0 8px 30px rgba(0,0,0,0.4)' : 'none',
                                    opacity: snapshot.isDragging ? 0.9 : 1,
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <span style={{ 
                                      fontSize: 11, textTransform: 'uppercase', fontWeight: 700, 
                                      color: PRIORITY_COLORS[item.priority] || 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4
                                    }}>
                                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[item.priority] || 'var(--text-muted)' }} />
                                      {item.priority} Priority
                                    </span>
                                  </div>
                                  
                                  <p style={{ fontWeight: 500, marginBottom: 12, fontSize: 14 }}>{item.content || item.title}</p>
                                  
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} /> {item.site_name || item.site || 'N/A'}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={12} /> {item.assignee_name || item.assignee || 'Unassigned'}</span>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={12} /> {item.due_date || item.dueDate || 'No date'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </DragDropContext>
            </div>
          )}

          {activeTab === 'myTasks' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 20, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>My Pending Assignments</h3>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Priority</th>
                      <th>Description</th>
                      <th>Site / Location</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTasks.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No pending tasks assigned to you.</td></tr>
                    ) : myTasks.map(task => (
                      <tr key={task.id}>
                        <td style={{ fontWeight: 600 }}>#{task.id}</td>
                        <td>
                           <span style={{ 
                              fontSize: 11, textTransform: 'uppercase', fontWeight: 700, 
                              color: PRIORITY_COLORS[task.priority] || 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4
                            }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[task.priority] || 'var(--text-muted)' }} />
                              {task.priority}
                            </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{task.content || task.title}</td>
                        <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {task.site_name || task.site || 'N/A'}</span></td>
                        <td>{task.due_date || task.dueDate || '—'}</td>
                        <td><span className={`badge ${task.status === 'in-progress' ? 'badge-active' : 'badge-pending'}`}>{COLUMN_TITLES[task.status]}</span></td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => { setSelectedTask(task); setModalType('complete'); setShowModal(true); }}>
                            Mark Complete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 20, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ fontSize: 16, fontWeight: 600 }}>Completed Task Reports</h3>
              </div>
              <div className="data-table-wrapper">
                 <table className="data-table">
                   <thead>
                     <tr>
                       <th>Task ID</th>
                       <th>Description</th>
                       <th>Site</th>
                       <th>Executant</th>
                       <th>Completion Notes</th>
                       <th>Proof / Media</th>
                       <th>Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {completedTasks.length === 0 ? (
                       <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No completed tasks found.</td></tr>
                     ) : completedTasks.map(task => (
                       <tr key={task.id}>
                         <td style={{ fontWeight: 600 }}>#{task.id}</td>
                         <td style={{ fontWeight: 500 }}>{task.content || task.title}</td>
                         <td>{task.site_name || task.site || '—'}</td>
                         <td style={{ fontWeight: 600 }}>{task.assignee_name || task.assignee || '—'}</td>
                         <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                           <FileText size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                           {task.notes || 'No notes provided'}
                         </td>
                         <td>
                            {task.media_url ? (
                              <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedTask(task); setModalType('viewMedia'); setShowModal(true); }}>
                                 <ImageIcon size={14} style={{ marginRight: 4 }} /> View
                              </button>
                            ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None</span>}
                         </td>
                         <td>
                            <span className={`badge ${task.status === 'done' ? 'badge-active' : 'badge-pending'}`}>{task.status === 'done' ? 'Verified' : 'Needs Review'}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>
                {modalType === 'create' && 'Create New Task'}
                {modalType === 'complete' && 'Complete Task'}
                {modalType === 'viewMedia' && 'Task Execution Media'}
              </h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {modalType === 'create' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const payload = {
                  title: fd.get('title'),
                  content: fd.get('content'),
                  site_id: fd.get('site_id'),
                  assignee_id: fd.get('assignee_id'),
                  priority: fd.get('priority'),
                  due_date: fd.get('due_date'),
                  status: 'todo'
                };
                try {
                  await api.post('/tasks/', payload);
                  fetchData();
                  setShowModal(false);
                } catch (err) { alert("Failed to create task"); }
              }}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Task Title</label>
                    <input name="title" type="text" className="form-input" placeholder="e.g. Inspect Generator B" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea name="content" className="form-input" rows="3" placeholder="Additional details..." />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Site ID</label>
                      <input name="site_id" type="number" className="form-input" placeholder="Site ID" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Assignee ID</label>
                      <input name="assignee_id" type="number" className="form-input" placeholder="Employee ID" />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select name="priority" className="form-select">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input name="due_date" type="date" className="form-input" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            )}

            {modalType === 'complete' && (
              <form onSubmit={handleCompleteSubmit}>
                <div className="modal-body">
                  <div className="alert alert-info" style={{ marginBottom: 20 }}>
                     Completing: <strong>{selectedTask?.content || selectedTask?.title}</strong>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion Notes / Remarks</label>
                    <textarea name="notes" className="form-input" rows="4" placeholder="Describe the work done..." required></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Report</button>
                </div>
              </form>
            )}

            {modalType === 'viewMedia' && (
              <div className="modal-body">
                 <div style={{ background: 'var(--surface-3)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, border: '1px dashed var(--border-subtle)' }}>
                     {selectedTask?.media_url ? (
                       <img src={selectedTask.media_url} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="Proof" />
                     ) : (
                       <div style={{ textAlign: 'center' }}>
                         <ImageIcon size={48} color="var(--primary-400)" />
                         <p style={{ marginTop: 8 }}>Media not available in this view</p>
                       </div>
                     )}
                 </div>
                 <div style={{ marginTop: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Completion Notes</h4>
                    <div className="card" style={{ background: 'var(--surface-2)', padding: 12, fontSize: 14, border: '1px solid var(--border-subtle)' }}>
                       {selectedTask?.notes}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .nav-item { cursor: pointer; transition: all 0.2s; font-weight: 500; color: var(--text-secondary); background: none; border: none; }
        .nav-item:hover { background: var(--surface-2); color: var(--text-primary); }
        .nav-item.active { color: var(--primary-400); font-weight: 600; }
        .data-table-wrapper { border-radius: 12px; }
      `}</style>
    </div>
  );
}
