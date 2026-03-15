import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { 
  Download, Filter, Calendar, Users, 
  FileText, TrendingUp, DollarSign, CheckCircle2 
} from 'lucide-react';

import api from '../../services/api';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [granularity, setGranularity] = useState('Monthly');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [employeeReports, setEmployeeReports] = useState({ Daily: [], Monthly: [], Yearly: [] });
  const [siteReports, setSiteReports] = useState([]);
  const [stats, setStats] = useState({
    avgAttendance: '0%',
    attendanceTrend: '+0%',
    totalExpenses: '₹0',
    expenseTrend: '+0%',
    tasksCompleted: '0',
    taskCompletionRate: '0%',
    efficiency: '0%'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/overview');
      setAttendanceData(res.data.attendance || []);
      setTaskData(res.data.tasks || []);
      setExpenseTrend(res.data.expenseTrend || []);
      setEmployeeReports(res.data.employees || { Daily: [], Monthly: [], Yearly: [] });
      setSiteReports(res.data.sites || []);
      if (res.data.stats) {
        setStats(prev => ({ ...prev, ...res.data.stats }));
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = (employeeReports[granularity] || []).filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All Departments' || emp.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const siteStats = {
    total: siteReports.length,
    completed: siteReports.filter(s => s.status === 'Completed').length,
    pending: siteReports.filter(s => s.status === 'Pending').length,
    needToVisit: siteReports.filter(s => s.status === 'Need to Visit').length
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Analyze workforce performance, attendance, and project costs</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">
            <Download size={16} /> Export PDF
          </button>
          <button className="btn btn-primary">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('Overview')}
              style={{ 
                padding: '12px 16px', border: 'none', background: 'none', color: activeTab === 'Overview' ? 'var(--primary-400)' : 'var(--text-muted)',
                borderBottom: activeTab === 'Overview' ? '2px solid var(--primary-400)' : 'none', cursor: 'pointer', fontWeight: 600
              }}
            >
              System Overview
            </button>
            <button 
              onClick={() => setActiveTab('Employees')}
              style={{ 
                padding: '12px 16px', border: 'none', background: 'none', color: activeTab === 'Employees' ? 'var(--primary-400)' : 'var(--text-muted)',
                borderBottom: activeTab === 'Employees' ? '2px solid var(--primary-400)' : 'none', cursor: 'pointer', fontWeight: 600
              }}
            >
              Employee Reports
            </button>
            <button 
              onClick={() => setActiveTab('Sites')}
              style={{ 
                padding: '12px 16px', border: 'none', background: 'none', color: activeTab === 'Sites' ? 'var(--primary-400)' : 'var(--text-muted)',
                borderBottom: activeTab === 'Sites' ? '2px solid var(--primary-400)' : 'none', cursor: 'pointer', fontWeight: 600
              }}
            >
              Site Reports
            </button>
          </div>

          {activeTab === 'Overview' && (
            <>
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className={`btn btn-sm ${granularity === 'Daily' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Daily')}>Today</button>
                    <button className={`btn btn-sm ${granularity === 'Weekly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Weekly')}>This Week</button>
                    <button className={`btn btn-sm ${granularity === 'Monthly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Monthly')}>This Month</button>
                    <button className={`btn btn-sm ${granularity === 'Yearly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Yearly')}>This Year</button>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', padding: '4px 12px', borderRadius: 8, fontSize: 13 }}>
                      <Users size={14} color="var(--primary-400)" />
                      <select 
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer' }}
                      >
                        <option>All Departments</option>
                        <option>Engineering</option>
                        <option>Sales</option>
                        <option>Marketing</option>
                        <option>Operations</option>
                      </select>
                    </div>
                    <button className="btn btn-secondary btn-sm"><Filter size={14} /> More Filters</button>
                  </div>
                </div>
              </div>

              <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Avg. Attendance</p>
                      <h2 style={{ fontSize: 24, fontWeight: 700 }}>{stats.avgAttendance}</h2>
                    </div>
                    <div className="icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success-400)' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: stats.attendanceTrend.startsWith('+') ? 'var(--success-400)' : 'var(--danger-400)', marginTop: 8 }}>
                    {stats.attendanceTrend} from last month
                  </p>
                </div>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Total Expenses</p>
                      <h2 style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalExpenses}</h2>
                    </div>
                    <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: stats.expenseTrend.startsWith('+') ? 'var(--danger-400)' : 'var(--success-400)', marginTop: 8 }}>
                    {stats.expenseTrend} from last month
                  </p>
                </div>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Tasks Completed</p>
                      <h2 style={{ fontSize: 24, fontWeight: 700 }}>{stats.tasksCompleted}</h2>
                    </div>
                    <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-400)' }}>
                      <FileText size={20} />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--success-400)', marginTop: 8 }}>{stats.taskCompletionRate} completion rate</p>
                </div>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Operational Efficiency</p>
                      <h2 style={{ fontSize: 24, fontWeight: 700 }}>{stats.efficiency}</h2>
                    </div>
                    <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)' }}>
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Steady performance</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div className="card">
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Departmental Attendance</h3>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                        <XAxis dataKey="name" fontSize={12} stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}
                          itemStyle={{ fontSize: 12 }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                        <Bar dataKey="present" fill="var(--primary-400)" radius={[4, 4, 0, 0]} barSize={24} name="Present" />
                        <Bar dataKey="late" fill="var(--warning-400)" radius={[4, 4, 0, 0]} barSize={24} name="Late" />
                        <Bar dataKey="absent" fill="var(--danger-400)" radius={[4, 4, 0, 0]} barSize={24} name="Absent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Task Status Distribution</h3>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {taskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Employees' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={`btn btn-sm ${granularity === 'Daily' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Daily')}>Daily</button>
                  <button className={`btn btn-sm ${granularity === 'Monthly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Monthly')}>Monthly</button>
                  <button className={`btn btn-sm ${granularity === 'Yearly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Yearly')}>Yearly</button>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Search employee..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
                    />
                    <Users size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      {granularity === 'Daily' ? (
                        <>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Status</th>
                          <th>OT</th>
                        </>
                      ) : (
                        <>
                          <th>Present</th>
                          <th>Absent</th>
                          <th>Late</th>
                          <th>OT (Hrs)</th>
                          <th>Rate %</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(emp => (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: 600 }}>{emp.name}</td>
                        <td>{emp.dept}</td>
                        {granularity === 'Daily' ? (
                          <>
                            <td>{emp.checkIn}</td>
                            <td>{emp.checkOut}</td>
                            <td>
                              <span className={`badge ${emp.status === 'On-Time' ? 'badge-active' : 'badge-pending'}`}>
                                {emp.status}
                              </span>
                            </td>
                            <td>{emp.ot}</td>
                          </>
                        ) : (
                          <>
                            <td>{emp.present}</td>
                            <td>{emp.absent}</td>
                            <td>{emp.late}</td>
                            <td>{emp.ot}h</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                  <div style={{ width: emp.rate, height: '100%', background: 'var(--primary-400)', borderRadius: 2 }} />
                                </div>
                                {emp.rate}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Sites' && (
            <>
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="card">
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Total Sites</p>
                  <h2 style={{ fontSize: 24, fontWeight: 700 }}>{siteStats.total}</h2>
                  <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: '100%', height: '100%', background: 'var(--primary-400)', borderRadius: 2 }} />
                  </div>
                </div>
                <div className="card">
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Completed</p>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--success-400)' }}>{siteStats.completed}</h2>
                  <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: `${(siteStats.completed/siteStats.total)*100}%`, height: '100%', background: 'var(--success-400)', borderRadius: 2 }} />
                  </div>
                </div>
                <div className="card">
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Pending</p>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning-400)' }}>{siteStats.pending}</h2>
                  <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: `${(siteStats.pending/siteStats.total)*100}%`, height: '100%', background: 'var(--warning-400)', borderRadius: 2 }} />
                  </div>
                </div>
                <div className="card">
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Need to Visit</p>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger-400)' }}>{siteStats.needToVisit}</h2>
                  <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: `${(siteStats.needToVisit/siteStats.total)*100}%`, height: '100%', background: 'var(--danger-400)', borderRadius: 2 }} />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Detailed Site Status</h3>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Site Name</th>
                        <th>Location</th>
                        <th>Manager</th>
                        <th>Status</th>
                        <th>Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteReports.map(site => (
                        <tr key={site.id}>
                          <td style={{ fontWeight: 600 }}>{site.name}</td>
                          <td>{site.location}</td>
                          <td>{site.manager}</td>
                          <td>
                            <span className={`badge ${
                              site.status === 'Completed' ? 'badge-active' : 
                              site.status === 'Pending' ? 'badge-pending' : 'badge-danger'
                            }`}>
                              {site.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                <div style={{ 
                                  width: site.completion, 
                                  height: '100%', 
                                  background: site.status === 'Completed' ? 'var(--success-400)' : 'var(--primary-400)', 
                                  borderRadius: 2 
                                }} />
                              </div>
                              {site.completion}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
