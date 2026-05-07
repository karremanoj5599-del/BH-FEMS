import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import siteService from '../../services/siteService';
import employeeService from '../../services/employeeService';
import taskService from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Filter, MapIcon, Activity, CheckCircle, X } from 'lucide-react';

import SiteGrid from './components/SiteGrid';
import SiteMap from './components/SiteMap';
import SiteModal from './components/SiteModal';

export default function SitesPage({ mode }) {
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [view, setView] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteTypeFilter, setSiteTypeFilter] = useState('all');
  const [executionFilter, setExecutionFilter] = useState('all');
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState({}); 
  const [siteTasks, setSiteTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', site_id: '', address: '', lat: '', long: '',
    geofence_radius: 100, status: 'Active', assigned_employee_ids: []
  });
  const [assignmentSearch, setAssignmentSearch] = useState('');

  useEffect(() => {
    if (selectedSite) {
      setFormData({
        name: selectedSite.name || '', site_id: selectedSite.site_id || '',
        address: selectedSite.address || '', lat: selectedSite.lat || '',
        long: selectedSite.long || '', geofence_radius: selectedSite.geofence_radius || 100,
        status: selectedSite.status || 'Active', assigned_employee_ids: assignments[selectedSite.id] || []
      });
      setTasksLoading(true);
      taskService.getTasks({ site_id: selectedSite.id })
        .then(res => setSiteTasks(res.data || []))
        .catch(console.error)
        .finally(() => setTasksLoading(false));
    } else {
      setFormData({
        name: '', site_id: '', address: '', lat: '', long: '',
        geofence_radius: 100, status: 'Active', assigned_employee_ids: []
      });
      setSiteTasks([]);
    }
  }, [selectedSite, assignments]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        site_type: siteTypeFilter !== 'all' ? siteTypeFilter : undefined,
      };

      const [siteRes, empRes] = await Promise.all([
        siteService.getSites(params),
        employeeService.getEmployees({ page_size: 100 })
      ]);
      setSites(siteRes.data || []);
      setEmployees(empRes.data.items || []);
      
      const initialAssignments = {};
      (siteRes.data || []).forEach(site => {
        initialAssignments[site.id] = site.assigned_employee_ids || [];
      });
      setAssignments(initialAssignments);
    } catch (err) {
      console.error("Failed to fetch site data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, siteTypeFilter]);

  const handleToggleAssignment = async (siteId, empId) => {
    try {
      const current = selectedSite ? (assignments[siteId] || []) : formData.assigned_employee_ids;
      const updated = current.includes(empId) ? current.filter(id => id !== empId) : [...current, empId];
      if (selectedSite) {
        await siteService.updateSite(siteId, { assigned_employee_ids: updated });
        setAssignments(prev => ({ ...prev, [siteId]: updated }));
      } else {
        setFormData(prev => ({ ...prev, assigned_employee_ids: updated }));
      }
    } catch (err) {
      console.error("Failed to update assignments:", err);
      alert("Failed to update assignments. Please try again.");
    }
  };

  const extractLocation = (input) => {
    const coordMatch = input.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordMatch) return { lat: parseFloat(coordMatch[1]), long: parseFloat(coordMatch[2]) };
    const urlMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlMatch) return { lat: parseFloat(urlMatch[1]), long: parseFloat(urlMatch[2]) };
    const qMatch = input.match(/[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), long: parseFloat(qMatch[2]) };
    return null;
  };

  const handleLocationPaste = (e) => {
    const val = e.target.value;
    if (!val) return;
    const loc = extractLocation(val);
    if (loc) {
      setFormData(prev => ({ ...prev, lat: loc.lat, long: loc.long }));
      e.target.value = ''; 
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");
    navigator.geolocation.getCurrentPosition(
      (pos) => setFormData(prev => ({ ...prev, lat: pos.coords.latitude.toFixed(6), long: pos.coords.longitude.toFixed(6) })),
      (err) => alert("Failed to get location: " + err.message)
    );
  };

  const handleSaveSite = async () => {
    try {
      setLoading(true);
      const payload = { 
        ...formData,
        lat: formData.lat === '' ? null : parseFloat(formData.lat),
        long: formData.long === '' ? null : parseFloat(formData.long),
        geofence_radius: parseFloat(formData.geofence_radius)
      };
      if (selectedSite) await siteService.updateSite(selectedSite.id, payload);
      else await siteService.createSite(payload);
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save site:", err);
      alert("Failed to save site.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = async (siteId) => {
    if (!window.confirm("Are you sure you want to delete this site?")) return;
    try {
      setLoading(true);
      await siteService.deleteSite(siteId);
      fetchData();
    } catch (err) {
      console.error("Failed to delete site:", err);
      alert("Failed to delete site.");
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  const filteredSites = sites.filter(site => {
    if (mode === 'new') {
      const createdDate = new Date(site.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (createdDate < sevenDaysAgo) return false;
    }
    if (mode === 'in-progress' && !['En Route', 'On Site'].includes(site.execution_status)) return false;
    if (mode === 'completed' && !['Completed', 'Finished'].includes(site.execution_status)) return false;
    if (executionFilter !== 'all' && site.execution_status !== executionFilter) return false;
    return true;
  });

  const getPageConfig = () => {
    switch (mode) {
      case 'new': return { title: 'New Sites', desc: 'Sites registered in the last 7 days.' };
      case 'in-progress': return { title: 'In Progress Sites', desc: 'Sites currently being visited or en route.' };
      case 'completed': return { title: 'Completed Sites', desc: 'Sites where work was completed today.' };
      default: return { title: 'Sites & Geofencing', desc: 'Advanced site management with GPS integration and real-time tracking.' };
    }
  };

  const { title, desc } = getPageConfig();

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="btn-group" style={{ background: 'var(--surface-2)', padding: 4, borderRadius: 10, display: 'flex' }}>
            <button className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('grid')}>List</button>
            <button className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('map')}>Map</button>
          </div>
          <button className="btn btn-primary" onClick={() => { setSelectedSite(null); setShowModal(true); }}>
            <Plus size={16} /> Add New Site
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: 6, display: 'flex', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
        <NavLink to="/sites" end className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, gap: 8 }}>
          <MapIcon size={14} /> All Sites
        </NavLink>
        <NavLink to="/sites/new" className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, gap: 8 }}>
          <Plus size={14} /> New Sites
        </NavLink>
        <NavLink to="/sites/in-progress" className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, gap: 8 }}>
          <Activity size={14} /> In Progress
        </NavLink>
        <NavLink to="/sites/completed" className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, gap: 8 }}>
          <CheckCircle size={14} /> Completed Sites
        </NavLink>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <>
          <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search name, address, ID..." 
                  style={{ paddingLeft: 40 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Archived">Archived</option>
                </select>
                <select className="form-select" style={{ width: 140 }} value={siteTypeFilter} onChange={(e) => setSiteTypeFilter(e.target.value)}>
                  <option value="all">All Types</option><option value="Office">Office</option><option value="Warehouse">Warehouse</option><option value="Construction">Construction</option><option value="Client Site">Client Site</option><option value="Other">Other</option>
                </select>
                <select className="form-select" style={{ width: 160 }} value={executionFilter} onChange={(e) => setExecutionFilter(e.target.value)}>
                  <option value="all">Execution: All</option><option value="No Activity">No Activity</option><option value="En Route">En Route</option><option value="On Site">On Site</option><option value="Completed">Completed</option>
                </select>
              </div>
              {(searchQuery || statusFilter !== 'all' || siteTypeFilter !== 'all' || executionFilter !== 'all') && (
                <button className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap', gap: 4, padding: '0 8px' }} onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSiteTypeFilter('all'); setExecutionFilter('all'); }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            {(searchQuery || statusFilter !== 'all' || siteTypeFilter !== 'all' || executionFilter !== 'all') && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Filter size={12} /><span>Showing {filteredSites.length} sites</span>
                </div>
                <div style={{ height: 12, width: 1, background: 'var(--border-subtle)' }} />
                {searchQuery && <span className="badge badge-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '2px 8px' }}>Search: {searchQuery}</span>}
                {statusFilter !== 'all' && <span className="badge badge-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '2px 8px' }}>Status: {statusFilter}</span>}
                {siteTypeFilter !== 'all' && <span className="badge badge-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '2px 8px' }}>Type: {siteTypeFilter}</span>}
                {executionFilter !== 'all' && <span className="badge badge-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '2px 8px' }}>Execution: {executionFilter}</span>}
              </div>
            )}
          </div>

          {view === 'grid' ? (
            <SiteGrid filteredSites={filteredSites} assignments={assignments} employees={employees} setSelectedSite={setSelectedSite} setShowModal={setShowModal} handleDeleteSite={handleDeleteSite} />
          ) : (
            <SiteMap filteredSites={filteredSites} assignments={assignments} />
          )}
        </>
      )}

      {showModal && (
        <SiteModal 
          selectedSite={selectedSite} formData={formData} setFormData={setFormData}
          handleGetLocation={handleGetLocation} handleLocationPaste={handleLocationPaste} handleSaveSite={handleSaveSite}
          setShowModal={setShowModal} tasksLoading={tasksLoading} siteTasks={siteTasks}
          assignmentSearch={assignmentSearch} setAssignmentSearch={setAssignmentSearch}
          filteredEmployees={filteredEmployees} assignments={assignments} handleToggleAssignment={handleToggleAssignment}
        />
      )}

      <style>{`
        .site-card { transition: all 0.3s ease; }
        .site-card:hover { transform: translateY(-4px); border-color: var(--primary-500); }
        .assigned-row { border-color: var(--primary-400) !important; background: rgba(99,102,241,0.05) !important; }
        .btn-group .btn { border-radius: 8px !important; margin: 0; }
        .form-select { width: 100%; padding: 8px 12px; }
      `}</style>
    </div>
  );
}
