/**
 * FEMS — Teams Page
 */
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, UsersRound } from 'lucide-react';

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', department_id: '', team_lead_id: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamRes, deptRes, empRes] = await Promise.all([
        api.get('/teams/'),
        api.get('/departments/'),
        api.get('/employees/', { params: { page_size: 100 } })
      ]);
      setTeams(teamRes.data);
      setDepartments(deptRes.data);
      setEmployees(empRes.data.items || []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setFormData({ name: '', department_id: '', team_lead_id: '' }); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setFormData({ name: t.name, department_id: t.department_id || '', team_lead_id: t.team_lead_id || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.department_id === '') payload.department_id = null;
    else payload.department_id = parseInt(payload.department_id, 10);
    
    if (payload.team_lead_id === '') payload.team_lead_id = null;
    else payload.team_lead_id = parseInt(payload.team_lead_id, 10);

    try {
      if (editing) await api.put(`/teams/${editing.id}`, payload);
      else await api.post('/teams/', payload);
      setShowModal(false); fetchData();
    } catch (err) { alert(err.response?.data?.detail || 'Error saving team'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return;
    try { await api.delete(`/teams/${id}`); fetchData(); } catch { alert('Error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>Teams</h1><p>Manage team structure</p></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Team</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Team Name</th><th>Department</th><th>Team Lead</th><th>Members</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr><td colSpan={5} className="empty-state"><h3>No teams found</h3></td></tr>
              ) : teams.map((team) => (
                <tr key={team.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UsersRound size={16} style={{ color: 'var(--primary-400)' }} /> {team.name}
                    </div>
                  </td>
                  <td>{team.department_name || '—'}</td>
                  <td>{team.team_lead_name || '—'}</td>
                  <td><span className="badge badge-active">{team.member_count || 0} members</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(team)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(team.id)} style={{ color: 'var(--danger-400)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Team' : 'Add Team'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-input" value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} required>
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Team Lead</label>
                  <select className="form-input" value={formData.team_lead_id} onChange={(e) => setFormData({ ...formData, team_lead_id: e.target.value })}>
                    <option value="">Select Lead</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
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
