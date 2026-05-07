import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash2, MapPin, User, Calendar, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

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

export default function BoardTab({ columns, onDragEnd, isEmployee, setSelectedTask, setModalType, setShowModal, handleDeleteTask }) {
  return (
    <div className="kanban-board-scroll-container" style={{ 
      display: 'flex', gap: 20, overflowX: 'auto', flex: 1, paddingBottom: 16, minWidth: 0 
    }}>
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
                            {!isEmployee && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-ghost btn-sm" style={{ padding: 4, height: 'auto', minHeight: 20 }} onClick={(e) => { e.stopPropagation(); setSelectedTask(item); setModalType('edit'); setShowModal(true); }}>
                                  <Edit2 size={14} color="var(--text-muted)" />
                                </button>
                                <button className="btn btn-ghost btn-sm" style={{ padding: 4, height: 'auto', minHeight: 20 }} onClick={(e) => { e.stopPropagation(); handleDeleteTask(item); }}>
                                  <Trash2 size={14} color="var(--danger-400)" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <p style={{ fontWeight: 500, marginBottom: 12, fontSize: 14 }}>{item.content || item.title}</p>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <MapPin size={12} /> 
                              {item.location ? (
                                <a href={item.location.match(/^https?:\/\//) ? item.location : `https://maps.google.com/?q=${encodeURIComponent(item.location)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                                  {item.location.length > 30 ? item.location.substring(0, 30) + '...' : item.location}
                                </a>
                              ) : (
                                <span>{item.site_name || item.site || 'N/A'}</span>
                              )}
                            </div>
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
  );
}
