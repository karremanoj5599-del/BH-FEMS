/**
 * FEMS — Roles Management Page
 * RBAC permission management with Add/Edit/Delete.
 */
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Shield, Check } from 'lucide-react';

const PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Employees' },
  { key: 'departments', label: 'Departments' },
  { key: 'teams', label: 'Teams' },
  { key: 'shifts', label: 'Manage Shifts' },
  { key: 'my_shifts', label: 'My Shifts' },
  { key: 'sites', label: 'Manage Sites' },
  { key: 'tasks', label: 'Manage Tasks' },
  { key: 'my_tasks', label: 'My Tasks' },
  { key: 'expenses', label: 'Manage Expenses' },
  { key: 'my_expenses', label: 'My Expenses' },
  { key: 'leaves', label: 'Manage Leaves' },
  { key: 'my_leaves', label: 'Apply Leaves' },
  { key: 'holidays', label: 'Holidays' },
  { key: 'attendance', label: 'Manage Attendance' },
  { key: 'my_attendance', label: 'My Attendance' },
  { key: 'reports', label: 'Manage Reports' },
  { key: 'my_reports', label: 'My Reports' },
  { key: 'roles', label: 'Roles & Access' },
  { key: 'logs', label: 'Activity Logs' },
];

export default function RolesList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: {} });

  const fetchRoles = () => {
    setLoading(true);
    api.get('/roles/')
      .then((res) => setRoles(res.data))
      .catch(() => {
        setRoles([
          { id: 1, name: 'Admin', description: 'Full system access', permissions: '{"all": true}' },
          { id: 2, name: 'HR', description: 'Human resources', permissions: '{"employees": true, "leaves": true, "departments": true}' },
          { id: 3, name: 'Manager', description: 'Department management', permissions: '{"employees": true, "sites": true, "tasks": true, "reports": true}' },
          { id: 4, name: 'Supervisor', description: 'Team supervision', permissions: '{"employees": true, "sites": true, "tasks": true, "attendance": true}' },
          { id: 5, name: 'Field Employee', description: 'Field operations', permissions: '{"my_attendance": true, "my_tasks": true, "my_expenses": true, "my_leaves": true, "my_shifts": true}' },
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoles(); }, []);

  const parsePermissions = (permsStr) => {
    try { return JSON.parse(permsStr || '{}'); } catch { return {}; }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ name: '', description: '', permissions: {} });
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: parsePermissions(role.permissions),
    });
    setShowModal(true);
  };

  const togglePermission = (key) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key],
      },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData, permissions: JSON.stringify(formData.permissions) };
    try {
      if (editing) await api.put(`/roles/${editing.id}`, payload);
      else await api.post('/roles/', payload);
      setShowModal(false); fetchRoles();
    } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this role?')) return;
    try { await api.delete(`/roles/${id}`); fetchRoles(); } catch { alert('Error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>Roles & Access Control</h1><p>Manage role-based permissions</p></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Role</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {roles.map((role) => {
            const perms = parsePermissions(role.permissions);
            const isAdmin = perms.all === true;
            return (
              <div key={role.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: isAdmin ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isAdmin ? 'var(--danger-400)' : 'var(--primary-400)',
                    }}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600 }}>{role.name}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{role.description}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(role)}><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(role.id)} style={{ color: 'var(--danger-400)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {isAdmin ? (
                    <span className="badge" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger-400)' }}>All Permissions</span>
                  ) : (
                    PERMISSIONS.filter((p) => perms[p.key]).map((p) => (
                      <span key={p.key} className="badge badge-active">{p.label}</span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Role' : 'Add Custom Role'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Role Name *</label>
                    <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Permissions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
                    {PERMISSIONS.map((perm) => (
                      <div key={perm.key} onClick={() => togglePermission(perm.key)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        background: formData.permissions[perm.key] ? 'rgba(99,102,241,0.08)' : 'transparent',
                        border: `1px solid ${formData.permissions[perm.key] ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
                        userSelect: 'none'
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 4,
                          background: formData.permissions[perm.key] ? 'var(--primary-500)' : 'transparent',
                          border: `2px solid ${formData.permissions[perm.key] ? 'var(--primary-500)' : 'var(--border-strong)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {formData.permissions[perm.key] && <Check size={12} color="white" />}
                        </div>
                        {perm.label}
                      </div>
                    ))}
                  </div>
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
