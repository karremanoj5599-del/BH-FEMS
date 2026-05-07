import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, DollarSign, FileText, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function OverviewTab({ 
  granularity, setGranularity, deptFilter, setDeptFilter, filterOptions, 
  stats, attendanceData, taskData 
}) {
  return (
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
                {filterOptions.departments.map(d => <option key={d.id}>{d.name}</option>)}
              </select>
            </div>
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
        <div className="card" style={{ minHeight: 400 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Departmental Attendance</h3>
          <div style={{ height: 320, width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={320}>
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

        <div className="card" style={{ minHeight: 400 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Task Status Distribution</h3>
          <div style={{ height: 320, width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={taskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
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
  );
}
