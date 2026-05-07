import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import taskService from '../../services/taskService';
import siteService from '../../services/siteService';
import employeeService from '../../services/employeeService';
import attendanceService from '../../services/attendanceService'; // Will create this next
import { useAuth } from '../../context/AuthContext';
import { Plus, Calendar, User, CheckCircle2, Search, X, Map as MapIcon } from 'lucide-react';

import BoardTab from './components/BoardTab';
import MyTasksTab from './components/MyTasksTab';
import ReportsTab from './components/ReportsTab';
import MapTab from './components/MapTab';
import TaskModals from './components/TaskModals';
import api from '../../services/api';

const ITEM_TYPES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done'
};

export default function TasksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isEmployeeView, user } = useAuth();
  const isEmployee = isEmployeeView('tasks');
  
  const [activeTab, setActiveTab] = useState(isEmployee ? 'myTasks' : 'board'); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({});
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Filters
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [detailTask, setDetailTask] = useState(null);
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [executionReport, setExecutionReport] = useState(null);
  const [executionReportLoading, setExecutionReportLoading] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const tasksRes = await taskService.getTasks();
      setTasks(tasksRes.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
    
    try {
      const sitesRes = await siteService.getSites();
      setSites(sitesRes.data || []);
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    }
    
    if (!isEmployee) {
      try {
        const employeesRes = await employeeService.getEmployees({ page_size: 100 });
        setEmployees(employeesRes.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    }
    setLoading(false);
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await api.get('/attendance/site/active-sessions'); // Will update when attendanceService is ready
      const sessions = res.data.sessions || [];
      setActiveSessions(sessions);
      const activeTaskSession = sessions.find(s => s.task_id);
      if (activeTaskSession) setExpandedTaskId(activeTaskSession.task_id);
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchActiveSessions();
  }, []);

  const getFilteredTasks = (taskList) => {
    return taskList.filter(task => {
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        const matchesSearch = 
          (task.content || task.title || '').toLowerCase().includes(q) ||
          (task.location || task.site_name || '').toLowerCase().includes(q) ||
          (`#${task.id}`).includes(taskSearch);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (siteFilter !== 'all' && task.site_id?.toString() !== siteFilter.toString()) return false;
      if (employeeFilter !== 'all' && task.assigned_employee?.toString() !== employeeFilter.toString()) return false;
      if (dateRange.start) {
        const taskDate = new Date(task.due_date || task.deadline);
        const startDate = new Date(dateRange.start);
        if (taskDate < startDate) return false;
      }
      if (dateRange.end) {
        const taskDate = new Date(task.due_date || task.deadline);
        const endDate = new Date(dateRange.end);
        if (taskDate > endDate) return false;
      }
      return true;
    });
  };

  useEffect(() => {
    const filtered = getFilteredTasks(tasks);
    const cols = {
      [ITEM_TYPES.TODO]: filtered.filter(t => t.status === 'todo'),
      [ITEM_TYPES.IN_PROGRESS]: filtered.filter(t => t.status === 'in-progress'),
      [ITEM_TYPES.REVIEW]: filtered.filter(t => t.status === 'review'),
      [ITEM_TYPES.DONE]: filtered.filter(t => t.status === 'done')
    };
    setColumns(cols);
    
    if (location.state?.openTaskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === location.state.openTaskId);
      if (task) {
        if (isEmployee) {
          navigate(`/execution/task/${task.id}`);
        } else {
          setDetailTask(task);
        }
        window.history.replaceState({}, document.title);
      }
    }
  }, [tasks, location.state, isEmployee, taskSearch, statusFilter, priorityFilter, siteFilter, employeeFilter, dateRange]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      try {
        await taskService.patchTask(draggableId, { status: destination.droppableId });
        setTasks(prev => prev.map(t => 
          t.id.toString() === draggableId.toString() ? { ...t, status: destination.droppableId } : t
        ));
      } catch (err) {
        console.error("Failed to update task status:", err);
        alert("Failed to update status. Please try again.");
      }
    }
  };

  const filteredAllTasks = getFilteredTasks(tasks);
  const myTasks = filteredAllTasks.filter(t => (t.assigned_employee === user?.id || t.assignee_name === user?.name) && t.status !== 'done');
  const myCompletedTasks = filteredAllTasks.filter(t => (t.assigned_employee === user?.id || t.assignee_name === user?.name) && t.status === 'done');
  const completedTasks = filteredAllTasks.filter(t => t.status === 'done' || t.status === 'review');

  const fetchExecutionReport = async (taskId) => {
    setExecutionReportLoading(true);
    try {
      const res = await taskService.getExecutionReport(taskId);
      setExecutionReport(res.data);
    } catch (err) {
      console.error("Failed to fetch execution report:", err);
      setExecutionReport(null);
    } finally {
      setExecutionReportLoading(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const notes = formData.get('notes');
    
    try {
      await taskService.patchTask(selectedTask.id, { status: 'done', notes, media_url: completionPhoto });
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id ? { ...t, status: 'done', notes, media_url: completionPhoto } : t
      ));
      fetchData(); 
      setShowModal(false);
      setSelectedTask(null);
      setCompletionPhoto(null);
    } catch (err) {
      alert("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        try {
            await taskService.deleteTask(task.id);
            if (detailTask?.id === task.id) setDetailTask(null);
            fetchData();
        } catch (err) {
            alert('Failed to delete task.');
        }
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1>Task & Work Order Management</h1>
          <p>Kanban board, personal assignments, and field execution reports.</p>
        </div>
        {!isEmployee && (
          <button className="btn btn-primary" onClick={() => { setModalType('create'); setShowModal(true); }}>
            <Plus size={16} /> Create Task
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 1 }}>
        <button
          className={`nav-item ${activeTab === 'myTasks' ? 'active' : ''}`}
          style={{ borderRadius: '12px 12px 0 0', padding: '12px 20px', borderBottom: activeTab === 'myTasks' ? '3px solid var(--primary-400)' : '3px solid transparent' }}
          onClick={() => setActiveTab('myTasks')}
        >
          <User size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> My Tasks
        </button>
        <button
          className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          style={{ borderRadius: '12px 12px 0 0', padding: '12px 20px', borderBottom: activeTab === 'reports' ? '3px solid var(--primary-400)' : '3px solid transparent' }}
          onClick={() => setActiveTab('reports')}
        >
          <CheckCircle2 size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> {isEmployee ? 'My Completed Tasks' : 'Task Reports'}
        </button>
        {!isEmployee && (
          <button
            className={`nav-item ${activeTab === 'board' ? 'active' : ''}`}
            style={{ borderRadius: '12px 12px 0 0', padding: '12px 20px', borderBottom: activeTab === 'board' ? '3px solid var(--primary-400)' : '3px solid transparent' }}
            onClick={() => setActiveTab('board')}
          >
            <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Team Kanban Board
          </button>
        )}
        <button
          className={`nav-item ${activeTab === 'taskMap' ? 'active' : ''}`}
          style={{ borderRadius: '12px 12px 0 0', padding: '12px 20px', borderBottom: activeTab === 'taskMap' ? '3px solid var(--primary-400)' : '3px solid transparent' }}
          onClick={() => setActiveTab('taskMap')}
        >
          <MapIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Task Map
        </button>
      </div>
      
      {/* GLOBAL FILTER BAR */}
      <div className="card filter-bar-container" style={{ 
        marginBottom: 20, padding: '12px 20px', background: 'var(--surface-1)', 
        border: '1px solid var(--border-subtle)', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none'
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 'max-content' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input type="text" className="form-input" placeholder="Search by title, location, ID..." style={{ paddingLeft: 40, background: 'var(--surface-2)' }} value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} />
          </div>

          {activeTab !== 'board' && (
            <select className="form-select" style={{ width: 140, background: 'var(--surface-2)' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="todo">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Completed</option>
            </select>
          )}

          <select className="form-select" style={{ width: 140, background: 'var(--surface-2)' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select className="form-select" style={{ width: 180, background: 'var(--surface-2)' }} value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
            <option value="all">All Sites</option>
            {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
          </select>

          {!isEmployee && (
            <select className="form-select" style={{ width: 180, background: 'var(--surface-2)' }} value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="all">All Employees</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="date" className="form-input" style={{ width: 130, padding: '4px 8px', fontSize: 12, background: 'var(--surface-2)' }} value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input type="date" className="form-input" style={{ width: 130, padding: '4px 8px', fontSize: 12, background: 'var(--surface-2)' }} value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
          </div>

          {(taskSearch || statusFilter !== 'all' || priorityFilter !== 'all' || siteFilter !== 'all' || employeeFilter !== 'all' || dateRange.start || dateRange.end) && (
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)', gap: 4 }} onClick={() => {
              setTaskSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setSiteFilter('all'); setEmployeeFilter('all'); setDateRange({ start: '', end: '' });
            }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ flex: 1 }}><div className="spinner" /></div>
      ) : (
        <>
          {activeTab === 'board' && <BoardTab columns={columns} onDragEnd={onDragEnd} isEmployee={isEmployee} setSelectedTask={setSelectedTask} setModalType={setModalType} setShowModal={setShowModal} handleDeleteTask={handleDeleteTask} />}
          {activeTab === 'myTasks' && <MyTasksTab myTasks={myTasks} taskSearch={taskSearch} isEmployee={isEmployee} detailTask={detailTask} setDetailTask={setDetailTask} expandedTaskId={expandedTaskId} navigate={navigate} setSelectedTask={setSelectedTask} setModalType={setModalType} setShowModal={setShowModal} handleDeleteTask={handleDeleteTask} />}
          {activeTab === 'reports' && <ReportsTab isEmployee={isEmployee} myCompletedTasks={myCompletedTasks} completedTasks={completedTasks} setSelectedTask={setSelectedTask} setModalType={setModalType} setShowModal={setShowModal} fetchExecutionReport={fetchExecutionReport} />}
          {activeTab === 'taskMap' && <MapTab filteredAllTasks={filteredAllTasks} sites={sites} tasks={tasks} />}
        </>
      )}

      {showModal && (
        <TaskModals 
          modalType={modalType} setShowModal={setShowModal} selectedTask={selectedTask} 
          sites={sites} employees={employees} detailTask={detailTask} setDetailTask={setDetailTask} 
          fetchData={fetchData} handleCompleteSubmit={handleCompleteSubmit} 
          completionPhoto={completionPhoto} handleFileChange={handleFileChange} 
          setCompletionPhoto={setCompletionPhoto} executionReportLoading={executionReportLoading} 
          executionReport={executionReport}
        />
      )}

      <style>{`
        .nav-item { cursor: pointer; transition: all 0.2s; font-weight: 500; color: var(--text-secondary); background: none; border: none; }
        .nav-item:hover { background: var(--surface-2); color: var(--text-primary); }
        .nav-item.active { color: var(--primary-400); font-weight: 600; }
        .data-table-wrapper { border-radius: 12px; }
        .my-tasks-section .task-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .my-tasks-section .task-card:hover { transform: translateY(-3px); border-color: var(--primary-400) !important; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.1) !important; }
        .filter-bar-container::-webkit-scrollbar { display: none; }
        .kanban-board-scroll-container { scrollbar-width: thin; scrollbar-color: var(--border-strong) transparent; }
        .kanban-board-scroll-container::-webkit-scrollbar { height: 6px; }
        .kanban-board-scroll-container::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
