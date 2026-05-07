import React from 'react';
import taskService from '../../../services/taskService';

export default function TaskModals({ 
  modalType, setShowModal, selectedTask, sites, employees, detailTask,
  setDetailTask, fetchData, handleCompleteSubmit, completionPhoto,
  handleFileChange, setCompletionPhoto, executionReportLoading, executionReport
}) {
  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: modalType === 'executionReport' ? 900 : 500, width: '95%' }}>
        <div className="modal-header">
          <h2>
            {modalType === 'create' && 'Create New Task'}
            {modalType === 'edit' && 'Edit Task'}
            {modalType === 'complete' && 'Complete Task'}
            {modalType === 'executionReport' && 'Task Execution Report'}
          </h2>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
        </div>

        {modalType === 'create' && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const checkedSites = e.target.querySelectorAll('input[name="site_ids"]:checked');
            const selectedSiteIds = Array.from(checkedSites).map(cb => parseInt(cb.value));

            const basePayload = {
              title: fd.get('title'),
              description: fd.get('description'),
              location: fd.get('location') || null,
              assigned_employee: parseInt(fd.get('assigned_employee')),
              priority: fd.get('priority') || 'medium',
              deadline: fd.get('deadline') || null,
              status: 'todo'
            };
            
            try {
              if (selectedSiteIds.length > 0) {
                await Promise.all(selectedSiteIds.map(siteId => 
                  taskService.createTask({ ...basePayload, site_id: siteId })
                ));
              } else {
                await taskService.createTask(basePayload);
              }
              fetchData();
              setShowModal(false);
            } catch (err) { 
              console.error("Create task error:", err);
              alert("Failed to create task"); 
            }
          }}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input name="title" type="text" className="form-input" placeholder="e.g. Inspect Generator B" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Work Details</label>
                <textarea name="description" className="form-input" rows="3" placeholder="Additional details..." required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Assign to Sites (Optional)</label>
                <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 8, background: 'var(--surface-1)' }}>
                  {sites.map(site => (
                    <label key={site.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" name="site_ids" value={site.id} style={{ accentColor: 'var(--primary-500)' }} />
                      <span>{site.name} <span style={{ color: 'var(--text-muted)' }}>({site.site_id})</span></span>
                    </label>
                  ))}
                  {sites.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: 8 }}>No sites available</div>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Location (Address or Google Maps Link)</label>
                  <input name="location" type="text" className="form-input" placeholder="e.g. 123 Main St or https://maps.app.goo.gl/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned To</label>
                  <select name="assigned_employee" className="form-select" required>
                    <option value="">Select employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.employee_id}</option>)}
                  </select>
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
                  <label className="form-label">Deadline / Due Date</label>
                  <input name="deadline" type="date" className="form-input" required />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Task</button>
            </div>
          </form>
        )}

        {modalType === 'edit' && selectedTask && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            
            const payload = {
              title: fd.get('title'),
              description: fd.get('description'),
              site_id: fd.get('site_id') ? parseInt(fd.get('site_id')) : null,
              location: fd.get('location') || null,
              assigned_employee: parseInt(fd.get('assigned_employee')),
              priority: fd.get('priority') || 'medium',
              deadline: fd.get('deadline') || null,
              status: fd.get('status') || selectedTask.status
            };
            
            try {
              const res = await taskService.updateTask(selectedTask.id, payload);
              fetchData();
              setShowModal(false);
              if (detailTask && detailTask.id === selectedTask.id) {
                 setDetailTask(res.data);
              }
            } catch (err) { 
              console.error("Edit task error:", err);
              alert("Failed to update task"); 
            }
          }}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input name="title" type="text" className="form-input" defaultValue={selectedTask.title || selectedTask.content} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Work Details</label>
                <textarea name="description" className="form-input" rows="3" defaultValue={selectedTask.description} required />
              </div>

              <div className="form-group">
                <label className="form-label">Assign to Site (Optional)</label>
                <select name="site_id" className="form-select" defaultValue={selectedTask.site_id || ''}>
                  <option value="">No Site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.site_id})</option>)}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Location (Address or Google Maps Link)</label>
                  <input name="location" type="text" className="form-input" defaultValue={selectedTask.location} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned To</label>
                  <select name="assigned_employee" className="form-select" defaultValue={selectedTask.assigned_employee} required>
                    <option value="">Select employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.employee_id}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select name="priority" className="form-select" defaultValue={selectedTask.priority}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline / Due Date</label>
                  <input name="deadline" type="date" className="form-input" defaultValue={selectedTask.deadline || selectedTask.due_date} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" defaultValue={selectedTask.status}>
                  <option value="todo">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
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
                <label className="form-label">Work Progress Photos</label>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <label className="btn btn-secondary" style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
                    <Camera size={16} style={{ marginRight: 6 }} /> Camera
                    <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
                  </label>
                  <label className="btn btn-secondary" style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
                    <ImageIcon size={16} style={{ marginRight: 6 }} /> Gallery
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </label>
                </div>
                {completionPhoto && (
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                    <img src={completionPhoto} alt="Progress Preview" style={{ maxHeight: 150, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <button type="button" className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: -8, right: -8, background: 'var(--surface-1)', borderRadius: '50%', padding: 4, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} onClick={() => setCompletionPhoto(null)}>
                      <X size={14} color="var(--danger-400)" />
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Completion Notes / Remarks</label>
                <textarea name="notes" className="form-input" rows="4" placeholder="Describe the work done, issues encountered, etc..." required></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setCompletionPhoto(null); }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Report</button>
            </div>
          </form>
        )}

        {modalType === 'executionReport' && (
          <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: 0 }}>
            {executionReportLoading ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <Loader2 className="spinner" size={32} color="var(--primary-400)" />
                <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Loading execution details...</p>
              </div>
            ) : executionReport ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Map Section */}
                <div style={{ height: 350, width: '100%', position: 'relative', background: 'var(--surface-3)' }}>
                  <MapContainer 
                    center={executionReport.gps_points?.[0] ? [executionReport.gps_points[0].lat, executionReport.gps_points[0].lng] : [17.3850, 78.4867]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {executionReport.gps_points?.length > 1 && (
                      <Polyline 
                        positions={executionReport.gps_points.map(p => [p.lat, p.lng])} 
                        color="var(--primary-400)" 
                        weight={4}
                        opacity={0.7}
                      />
                    )}
                    {executionReport.gps_points?.map((p, idx) => (
                      (idx === 0 || idx === executionReport.gps_points.length - 1) && (
                        <Marker key={idx} position={[p.lat, p.lng]}>
                           <Popup>
                              <div style={{ fontSize: 12 }}>
                                 <strong>{idx === 0 ? "Start Point" : "End Point"}</strong><br/>
                                 {new Date(p.timestamp).toLocaleTimeString()}
                              </div>
                           </Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                  <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 1000, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 8, fontSize: 11, backdropFilter: 'blur(4px)' }}>
                     {executionReport.gps_points?.length || 0} location points logged
                  </div>
                </div>

                <div style={{ padding: 24 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
                      <div>
                         <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Execution Journey</h4>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 12 }}>
                            <div style={{ position: 'absolute', left: 4, top: 8, bottom: 8, width: 2, background: 'var(--border-subtle)', borderRadius: 1 }} />
                            
                            {executionReport.timeline?.map((event, idx) => (
                              <div key={idx} style={{ position: 'relative', paddingLeft: 24, paddingBottom: 24 }}>
                                 <div style={{ 
                                   position: 'absolute', left: -26, top: 0, width: 12, height: 12, borderRadius: '50%', 
                                   background: event.type === 'completed' ? 'var(--success-500)' : 'var(--primary-500)',
                                   border: '3px solid var(--surface-1)',
                                   boxShadow: '0 0 0 1px var(--border-subtle)'
                                 }} />
                                 <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{event.label}</div>
                                 <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={12} /> {new Date(event.timestamp).toLocaleString()}
                                 </div>
                              </div>
                            ))}
                         </div>

                         {executionReport.photos?.length > 0 && (
                           <div style={{ marginTop: 8 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Captured Proofs</h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                                 {executionReport.photos.map((photo, idx) => (
                                   <div key={idx} style={{ aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} onClick={() => window.open(photo, '_blank')}>
                                      <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Execution Proof ${idx + 1}`} />
                                   </div>
                                 ))}
                              </div>
                           </div>
                         )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                         <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Executant</h4>
                            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-2)' }}>
                               <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                                  {executionReport.employee?.name?.charAt(0)}
                               </div>
                               <div>
                                  <div style={{ fontWeight: 700 }}>{executionReport.employee?.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {executionReport.employee?.employee_id}</div>
                               </div>
                            </div>
                         </div>

                         <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Completion Notes</h4>
                            <div className="card" style={{ padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', minHeight: 100 }}>
                               <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                  {executionReport.notes || 'No remarks provided for this execution.'}
                               </p>
                            </div>
                         </div>

                         <div style={{ marginTop: 'auto' }}>
                             <button className="btn btn-secondary" style={{ width: '100%', borderRadius: 10 }} onClick={() => {
                                if (executionReport.task?.location) {
                                  window.open(`https://maps.google.com/?q=${encodeURIComponent(executionReport.task.location)}`, '_blank');
                                }
                             }}>
                                <Navigation size={14} /> View Task Location
                             </button>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: 'center' }}>
                 <AlertCircle size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                 <h3>Report Not Found</h3>
                 <p style={{ color: 'var(--text-muted)' }}>We couldn't retrieve execution data for this task.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
