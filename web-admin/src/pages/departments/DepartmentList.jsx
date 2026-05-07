/**
 * FEMS — Departments Page
 */
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Building2 } from 'lucide-react';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active', manager_id: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments/'),
        api.get('/employees/', { params: { page_size: 100 } })
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data.items || []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setFormData({ name: '', description: '', status: 'Active', manager_id: '' }); setShowModal(true); };
  const openEdit = (dept) => { setEditing(dept); setFormData({ name: dept.name, description: dept.description || '', status: dept.status, manager_id: dept.manager_id || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.manager_id === '') payload.manager_id = null;
    else payload.manager_id = parseInt(payload.manager_id, 10);

    try {
      if (editing) await api.put(`/departments/${editing.id}`, payload);
      else await api.post('/departments/', payload);
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.detail || 'Error saving department'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try { await api.delete(`/departments/${id}`); fetchData(); } catch { alert('Error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>Departments</h1><p>Manage organizational departments</p></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Department</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {departments.map((dept) => (
            <div key={dept.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{dept.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dept.description || 'No description'}</p>
                  </div>
                </div>
                <span className={`badge ${dept.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{dept.status}</span>
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Head: </span>
                <span style={{ fontWeight: 500 }}>{dept.manager_name || 'Not assigned'}</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{dept.employee_count || 0} employees</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(dept)}><Edit2 size={14} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(dept.id)} style={{ color: 'var(--danger-400)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Department' : 'Add Department'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Head of Department</label>
                  <select className="form-input" value={formData.manager_id} onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}>
                    <option value="">Select Head</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
