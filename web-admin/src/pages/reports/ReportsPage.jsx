import React, { useState, useEffect, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import OverviewTab from './components/OverviewTab';
import EmployeesTab from './components/EmployeesTab';
import SitesTab from './components/SitesTab';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [granularity, setGranularity] = useState('Daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [employeeReports, setEmployeeReports] = useState({ Daily: [], Monthly: [], Yearly: [] });
  const [siteReports, setSiteReports] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ departments: [], teams: [], shifts: [], statuses: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    avgAttendance: '0%', attendanceTrend: '+0%', totalExpenses: '₹0',
    expenseTrend: '+0%', tasksCompleted: '0', taskCompletionRate: '0%', efficiency: '0%'
  });

  const [filters, setFilters] = useState({
    department: '', team: '', shift: '', status: '', hasOT: '', sitesVisited: '',
    sitesMissing: '', tasksVisited: '', tasksMissed: '', hasSwaps: '',
  });

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearAllFilters = () => {
    setFilters({ department: '', team: '', shift: '', status: '', hasOT: '', sitesVisited: '', sitesMissing: '', tasksVisited: '', tasksMissed: '', hasSwaps: '' });
    setSearchTerm('');
  };

  const activeFilterCount = useMemo(() => Object.values(filters).filter(v => v !== '').length + (searchTerm ? 1 : 0), [filters, searchTerm]);

  const navigateDate = (direction) => {
    const d = new Date(selectedDate + 'T00:00:00');
    if (granularity === 'Daily') d.setDate(d.getDate() + direction);
    else if (granularity === 'Monthly') d.setMonth(d.getMonth() + direction);
    else d.setFullYear(d.getFullYear() + direction);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const goToToday = () => setSelectedDate(new Date().toISOString().split('T')[0]);
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/overview', { params: { date: selectedDate } });
      setAttendanceData(res.data.attendance || []);
      setTaskData(res.data.tasks || []);
      setEmployeeReports(res.data.employees || { Daily: [], Monthly: [], Yearly: [] });
      setSiteReports(res.data.sites || []);
      if (res.data.filterOptions) setFilterOptions(res.data.filterOptions);
      if (res.data.stats) setStats(prev => ({ ...prev, ...res.data.stats }));
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const filteredData = useMemo(() => {
    return (employeeReports[granularity] || []).filter(emp => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (!emp.name?.toLowerCase().includes(s) && !emp.empCode?.toLowerCase().includes(s)) return false;
      }
      if (filters.department && emp.dept !== filters.department) return false;
      if (filters.team && emp.team !== filters.team) return false;
      if (filters.status && granularity === 'Daily' && emp.status !== filters.status) return false;
      if (filters.shift && granularity === 'Daily' && emp.shift !== filters.shift) return false;
      if (filters.hasOT === 'yes' && emp.ot === '0h') return false;
      if (filters.hasOT === 'no' && emp.ot !== '0h') return false;
      if (filters.sitesVisited === 'yes' && granularity === 'Daily' && (emp.sitesVisited || 0) === 0) return false;
      if (filters.sitesVisited === 'no' && granularity === 'Daily' && (emp.sitesVisited || 0) > 0) return false;
      if (filters.sitesMissing === 'yes' && granularity === 'Daily' && (emp.sitesMissing || 0) === 0) return false;
      if (filters.sitesMissing === 'no' && granularity === 'Daily' && (emp.sitesMissing || 0) > 0) return false;
      if (filters.tasksVisited === 'yes' && granularity === 'Daily' && (emp.tasksVisited || 0) === 0) return false;
      if (filters.tasksVisited === 'no' && granularity === 'Daily' && (emp.tasksVisited || 0) > 0) return false;
      if (filters.tasksMissed === 'yes' && granularity === 'Daily' && (emp.tasksMissed || 0) === 0) return false;
      if (filters.tasksMissed === 'no' && granularity === 'Daily' && (emp.tasksMissed || 0) > 0) return false;
      if (filters.hasSwaps === 'yes' && granularity === 'Daily' && (emp.swaps || 0) === 0) return false;
      if (filters.hasSwaps === 'no' && granularity === 'Daily' && (emp.swaps || 0) > 0) return false;
      return true;
    });
  }, [employeeReports, granularity, searchTerm, filters]);

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
          <button className="btn btn-secondary"><Download size={16} /> Export PDF</button>
          <button className="btn btn-primary"><Download size={16} /> Export Excel</button>
        </div>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            {['Overview', 'Employees', 'Sites'].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '12px 16px', border: 'none', background: 'none', 
                  color: activeTab === tab ? 'var(--primary-400)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--primary-400)' : 'none', 
                  cursor: 'pointer', fontWeight: 600
                }}
              >
                {tab === 'Overview' ? 'System Overview' : tab === 'Employees' ? 'Employee Reports' : 'Site Reports'}
              </button>
            ))}
          </div>

          {activeTab === 'Overview' && <OverviewTab granularity={granularity} setGranularity={setGranularity} deptFilter={deptFilter} setDeptFilter={setDeptFilter} filterOptions={filterOptions} stats={stats} attendanceData={attendanceData} taskData={taskData} />}
          {activeTab === 'Employees' && <EmployeesTab granularity={granularity} setGranularity={setGranularity} selectedDate={selectedDate} setSelectedDate={setSelectedDate} navigateDate={navigateDate} isToday={isToday} goToToday={goToToday} searchTerm={searchTerm} setSearchTerm={setSearchTerm} showFilters={showFilters} setShowFilters={setShowFilters} activeFilterCount={activeFilterCount} clearAllFilters={clearAllFilters} filters={filters} updateFilter={updateFilter} filterOptions={filterOptions} filteredData={filteredData} employeeReports={employeeReports} navigate={navigate} />}
          {activeTab === 'Sites' && <SitesTab siteStats={siteStats} siteReports={siteReports} />}
        </>
      )}
    </div>
  );
}
