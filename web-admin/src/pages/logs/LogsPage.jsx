import React, { useState, useEffect } from 'react';
import { 
  Activity, Search, Filter, Calendar, 
  User, Database, Shield, Monitor, 
  Download, Clock, ChevronDown, RefreshCw
} from 'lucide-react';

import api from '../../services/api';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs/');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Success': return 'var(--success-400)';
      case 'Warning': return 'var(--warning-400)';
      case 'Danger': return 'var(--danger-400)';
      default: return 'var(--primary-400)';
    }
  };

  const getLogIcon = (type) => {
    switch(type) {
      case 'Security': return <Shield size={16} />;
      case 'Data': return <Database size={16} />;
      case 'Admin': return <User size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const logDesc = log.changes_json || '';
    const logUser = log.user_name || 'System';
    const logAction = log.action || '';
    const logType = log.entity_type || 'System';

    const matchesSearch = logDesc.toLowerCase().includes(search.toLowerCase()) || 
                          logUser.toLowerCase().includes(search.toLowerCase()) ||
                          logAction.toLowerCase().includes(search.toLowerCase());
    // We map 'All' to match any. For specific types, we match the entity_type
    // Since original types were Security/Data/Admin/System, we'll map them loosely
    const matchesType = filterType === 'All' || 
                       (filterType === 'Security' && logType === 'Security') ||
                       (filterType === 'Data' && (logType === 'Task' || logType === 'Site')) ||
                       (filterType === 'Admin' && (logType === 'Employee' || logType === 'Role')) ||
                       (filterType === 'System' && logType === 'System') || 
                       logType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Activity & Audit Logs</h1>
          <p>Monitor system-wide actions and security events</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" disabled>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search logs by description or user..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 40 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Security', 'Data', 'Admin', 'System'].map(type => (
              <button 
                key={type} 
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Description</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 10, 
                        color: log.entity_type === 'Security' ? 'var(--danger-400)' : 'inherit'
                      }}>
                        {getLogIcon(log.entity_type)}
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{log.entity_type || 'System'}</span>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{log.action}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                          {(log.user_name || 'S').charAt(0)}
                        </div>
                        <span style={{ fontSize: 13 }}>{log.user_name || 'System'}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 300 }} className="text-truncate">
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{log.changes_json || 'No details provided'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        background: `${getStatusColor('Success')}20`, 
                        color: getStatusColor('Success'),
                        border: `1px solid ${getStatusColor('Success')}40`
                      }}>
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No logs found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 24, background: 'rgba(99, 102, 241, 0.02)', border: '1px dashed var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)' }}>
            <Activity size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Audit Retention Protocol</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              System logs are preserved for 365 days. Security events are immutably archived every 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
