/**
 * FEMS — Employee List Page
 * Searchable, paginated table with Add/Edit/Delete and CSV import/export.
 */
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, Upload, Download, Edit2, Trash2, Eye, X } from 'lucide-react';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [roles, setRoles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '', name: '', email: '', password: '', phone: '',
    designation: '', status: 'Active', type: 'Permanent',
    department_id: '', team_id: '', role_id: '', supervisor_id: '', address: '',
    joining_date: '', emergency_contact_phone: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const params = { page, page_size: 20 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    try {
      const [empRes, deptRes, teamRes, roleRes] = await Promise.all([
        api.get('/employees/', { params }),
        api.get('/departments/'),
        api.get('/teams/'),
        api.get('/roles/')
      ]);
      setEmployees(empRes.data.items);
      setTotal(empRes.data.total);
      setTotalPages(empRes.data.total_pages);
      setDepartments(deptRes.data);
      setTeams(teamRes.data);
      setRoles(roleRes.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const openAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employee_id: '', name: '', email: '', password: '', phone: '',
      designation: '', status: 'Active', type: 'Permanent',
      department_id: '', team_id: '', role_id: '', supervisor_id: '', address: '',
      joining_date: '', emergency_contact_phone: '',
    });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({ 
      ...emp, 
      password: '', 
      department_id: emp.department_id || '', 
      team_id: emp.team_id || '',
      supervisor_id: emp.supervisor_id || '',
      joining_date: emp.joining_date || '',
      emergency_contact_phone: emp.emergency_contact_phone || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Clean up data before sending to backend to prevent Pydantic 422 errors
    const payload = { ...formData };
    
    // Convert empty strings to null for ID fields and optional fields
    const idFields = ['department_id', 'team_id', 'role_id', 'supervisor_id'];
    idFields.forEach(field => {
      if (payload[field] === '' || payload[field] === undefined) {
        payload[field] = null;
      } else if (payload[field] !== null) {
        payload[field] = parseInt(payload[field], 10);
      }
    });

    // Handle optional string fields that should be null if empty
    if (payload.phone === '') payload.phone = null;
    if (payload.designation === '') payload.designation = null;
    if (payload.address === '') payload.address = null;
    if (payload.joining_date === '') payload.joining_date = null;
    if (payload.emergency_contact_phone === '') payload.emergency_contact_phone = null;

    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, payload);
      } else {
        await api.post('/employees/', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Save error:", err.response?.data);
      const detail = err.response?.data?.detail;
      const status = err.response?.status;
      if (Array.isArray(detail)) {
        alert(`Validation error (${status}):\n` + detail.map(d => `${d.loc[1]}: ${d.msg}`).join("\n"));
      } else {
        alert(`Error (${status}): ` + (detail || 'Error saving employee'));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting employee');
    }
  };

  const statusBadge = (status) => {
    const cls = status === 'Active' ? 'badge-active' : status === 'Inactive' ? 'badge-inactive' : 'badge-resigned';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>{total} total employees</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" title="Import CSV">
            <Upload size={14} /> Import
          </button>
          <button className="btn btn-secondary btn-sm" title="Export CSV">
            <Download size={14} /> Export
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              className="search-input"
              placeholder="Search by name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              <Search size={14} />
            </button>
          </form>
        </div>
        <div className="toolbar-right">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Team</th>
                  <th>System Role</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={9} className="empty-state"><h3>No employees found</h3></td></tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{emp.employee_id}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{emp.name}</td>
                      <td>{emp.designation || '—'}</td>
                      <td>{emp.department_name || '—'}</td>
                      <td>{emp.team_name || '—'}</td>
                      <td><span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>{emp.role_name || '—'}</span></td>
                      <td><span className="badge badge-pending">{emp.type}</span></td>
                      <td>{statusBadge(emp.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" title="View"><Eye size={14} /></button>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEdit(emp)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Delete" onClick={() => handleDelete(emp.id)}
                            style={{ color: 'var(--danger-400)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {Math.min((page - 1) * 20 + 1, total)} – {Math.min(page * 20, total)} of {total}
            </div>
            <div className="pagination-buttons">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i + 1} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Employee ID *</label>
                    <input className="form-input" placeholder="EMP-001" value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      required disabled={!!editingEmployee} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="John Doe" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" placeholder="john@fems.com" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  {!editingEmployee && (
                    <div className="form-group">
                      <label className="form-label">Password *</label>
                      <input className="form-input" type="password" placeholder="Min 6 characters" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="+91 9876543210" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input className="form-input" placeholder="e.g. Technician" value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-input" value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value, team_id: '' })}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team</label>
                    <select className="form-input" value={formData.team_id}
                      onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                      disabled={!formData.department_id}>
                      <option value="">Select Team</option>
                      {teams.filter(t => t.department_id.toString() === formData.department_id.toString()).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Resigned">Resigned</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role *</label>
                    <select className="form-input" value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} required>
                      <option value="">Assign Role...</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supervisor</label>
                    <select className="form-input" value={formData.supervisor_id}
                      onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}>
                      <option value="">Select Supervisor</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input className="form-input" type="date" value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input className="form-input" placeholder="Emergency Phone" value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" placeholder="Full address" value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingEmployee ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
