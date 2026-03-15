/**
 * FEMS — App Root
 * React Router configuration with auth-guarded layout.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import DepartmentList from './pages/departments/DepartmentList';
import TeamList from './pages/teams/TeamList';
import RolesList from './pages/roles/RolesList';
import ShiftsPage from './pages/shifts/ShiftsPage';
import SitesPage from './pages/sites/SitesPage';
import TasksPage from './pages/tasks/TasksPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import AttendancePage from './pages/attendance/AttendancePage';
import LeavesPage from './pages/leaves/LeavesPage';
import HolidaysPage from './pages/holidays/HolidaysPage';
import ReportsPage from './pages/reports/ReportsPage';
import LogsPage from './pages/logs/LogsPage';
import EmployeePortal from './pages/portal/EmployeePortal';
import { Placeholder } from './pages/Placeholders';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — inside MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portal" element={<EmployeePortal />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/teams" element={<TeamList />} />
            <Route path="/roles" element={<RolesList />} />
            
            {/* Phase 2: Sites & Shifts */}
            <Route path="/shifts" element={<ShiftsPage />} />
            <Route path="/sites" element={<SitesPage />} />
            
            {/* Phase 3: Tasks & Expenses */}
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            
            {/* Phase 4: Attendance */}
            <Route path="/attendance" element={<AttendancePage />} />
            
            {/* Phase 5: Leaves & Holidays */}
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/holidays" element={<HolidaysPage />} />
            
            {/* Phase 6: Reports */}
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Phase 7: Logs */}
            <Route path="/logs" element={<LogsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
