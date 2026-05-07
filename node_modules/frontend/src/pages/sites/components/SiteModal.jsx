import React from 'react';
import { X, MapPin, AlertTriangle, ClipboardList, Search, CheckCircle } from 'lucide-react';

export default function SiteModal({ 
  selectedSite, formData, setFormData, 
  handleGetLocation, handleLocationPaste, handleSaveSite, setShowModal,
  tasksLoading, siteTasks, 
  assignmentSearch, setAssignmentSearch, filteredEmployees, assignments, handleToggleAssignment 
}) {
  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selectedSite ? `Assignments: ${selectedSite.name}` : 'Create New Site'}</h2>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
          {/* Site Info Column */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Site Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Site Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Site ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.site_id}
                  onChange={(e) => setFormData({...formData, site_id: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Full Address</label>
              <textarea 
                className="form-input" 
                rows={2} 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="card" style={{ marginTop: 20, background: 'rgba(99,102,241,0.03)', border: '1px dashed var(--primary-400)' }}>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-400)' }}>GPS Location</h4>
                  <button className="btn btn-ghost btn-xs" onClick={handleGetLocation}>
                     <MapPin size={12} style={{ marginRight: 4 }} /> Use Current Location
                  </button>
                </div>
                
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Paste Google Maps Link or Coordinates</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Paste URL or 'lat, long' here..."
                    onChange={handleLocationPaste}
                    style={{ fontSize: 12 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11 }}>Latitude</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.lat}
                      onChange={(e) => setFormData({...formData, lat: e.target.value})}
                      placeholder="0.000000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11 }}>Longitude</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.long}
                      onChange={(e) => setFormData({...formData, long: e.target.value})}
                      placeholder="0.000000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
               <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} color="var(--warning-400)" /> Geofence Configuration
                </div>
                <div className="card" style={{ background: 'var(--surface-2)', padding: 16 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Radius <span>{formData.geofence_radius}m</span>
                  </label>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="50" 
                    className="form-input" 
                    style={{ padding: 0 }} 
                    value={formData.geofence_radius}
                    onChange={(e) => setFormData({...formData, geofence_radius: parseInt(e.target.value)})}
                  />
                </div>
            </div>

            {/* Completed Tasks Section */}
            {selectedSite && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClipboardList size={14} color="var(--primary-400)" /> Tasks at Site
                </div>
                <div className="card" style={{ background: 'var(--surface-2)', padding: 0, overflow: 'hidden' }}>
                  {tasksLoading ? (
                     <div style={{ padding: 20, textAlign: 'center' }}>
                        <div className="spinner" style={{ width: 20, height: 20, margin: '0 auto', borderColor: 'var(--border-subtle)', borderTopColor: 'var(--primary-400)' }} />
                     </div>
                  ) : siteTasks.length === 0 ? (
                     <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        No tasks assigned to this site.
                     </div>
                  ) : (
                     <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {siteTasks.map(task => {
                           const statusMap = {
                             'done': { label: 'Completed', color: 'var(--success-500)', bg: 'rgba(16, 185, 129, 0.1)' },
                             'review': { label: 'In Review', color: 'var(--warning-500)', bg: 'rgba(245, 158, 11, 0.1)' },
                             'in-progress': { label: 'In Progress', color: 'var(--primary-500)', bg: 'rgba(59, 130, 246, 0.1)' },
                             'todo': { label: 'Pending', color: 'var(--text-muted)', bg: 'rgba(107, 114, 128, 0.1)' },
                             'pending': { label: 'Pending', color: 'var(--text-muted)', bg: 'rgba(107, 114, 128, 0.1)' }
                           };
                           const statusKey = (task.status || 'todo').toLowerCase();
                           const status = statusMap[statusKey] || statusMap['todo'];
                           
                           return (
                             <div key={task.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                   <div style={{ fontSize: 13, fontWeight: 600 }}>{task.title || task.content}</div>
                                   <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                      By {task.assignee_name || 'Unknown'} • {task.due_date || task.start_time ? new Date(task.start_time || task.due_date).toLocaleDateString() : 'No date'}
                                   </div>
                                </div>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: status.bg, color: status.color, fontWeight: 600 }}>
                                   {status.label}
                                </span>
                             </div>
                           );
                        })}
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assignment Column */}
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Assign Employees</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search staff..." 
                  style={{ paddingLeft: 32, fontSize: 13 }} 
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                />
              </div>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredEmployees.map(emp => {
                const isAssigned = selectedSite 
                  ? (assignments[selectedSite.id] || []).includes(emp.id)
                  : formData.assigned_employee_ids.includes(emp.id);
                return (
                  <div 
                    key={emp.id} 
                    className={`card ${isAssigned ? 'assigned-row' : ''}`}
                    style={{ 
                      padding: '10px 12px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isAssigned ? 'rgba(99,102,241,0.08)' : 'var(--surface-2)',
                      borderColor: isAssigned ? 'var(--primary-400)' : 'transparent',
                      borderWidth: 1,
                      borderStyle: 'solid'
                    }}
                    onClick={() => handleToggleAssignment(selectedSite?.id, emp.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.designation}</div>
                      </div>
                    </div>
                    {isAssigned && <CheckCircle size={14} color="var(--primary-400)" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveSite}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
