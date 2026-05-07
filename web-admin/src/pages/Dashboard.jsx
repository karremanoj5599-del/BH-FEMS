/**
 * FEMS — Dashboard Page
 * Real-time stats, charts, and quick actions.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users, MapPin, CheckCircle, ClipboardList, Building2,
  TrendingUp, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/metrics')
      .then((res) => {
        setMetrics(res.data);
      })
      .catch((err) => {
        console.error("Dashboard metrics failed:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const stats = [
    { label: 'Active Employees', value: metrics?.active_employees || 0, icon: Users, variant: 'primary' },
    { label: 'On Site Now', value: metrics?.on_site_now || 0, icon: MapPin, variant: 'accent' },
    { label: 'Attendance Today', value: `${metrics?.attendance_percentage || 0}%`, icon: CheckCircle, variant: 'warning' },
    { label: 'Sites Visited', value: metrics?.sites_visited_today || 0, icon: Building2, variant: 'primary' },
    { label: 'Pending Tasks', value: metrics?.pending_tasks || 0, icon: ClipboardList, variant: 'danger' },
  ];

  const weeklyAttendance = metrics?.weekly_attendance || [];
  const departmentDistribution = metrics?.department_distribution || [];
  const hourlyActivity = metrics?.hourly_activity || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}. Here's today's overview.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <Clock size={14} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`card stat-card ${stat.variant}`}>
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Weekly Attendance Chart */}
        <div className="card" style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            <TrendingUp size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Weekly Attendance
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1e2030',
                  border: '1px solid rgba(148,163,184,0.15)',
                  borderRadius: 8, fontSize: 12,
                }}
              />
              <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="card" style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Department Distribution</h3>
          {departmentDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentDistribution.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e2030',
                      border: '1px solid rgba(148,163,184,0.15)',
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {departmentDistribution.map((dept, i) => (
                  <div key={dept.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span style={{ color: 'var(--text-muted)' }}>{dept.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="card" style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Today's Check-in Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={hourlyActivity}>
            <defs>
              <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: '#1e2030',
                border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: 8, fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="checkins" stroke="#6366f1" fillOpacity={1} fill="url(#colorCheckins)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
