import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import DepartmentList from './pages/departments/DepartmentList';
import TeamList from './pages/teams/TeamList';
import RolesList from './pages/roles/RolesList';
import ShiftsPage from './pages/shifts/ShiftsPage';
import MyShiftsPage from './pages/shifts/MyShiftsPage';
import EmployeeShiftPlanner from './pages/shifts/EmployeeShiftPlanner';
import SitesPage from './pages/sites/SitesPage';
import MySitesPage from './pages/sites/MySitesPage';
import TasksPage from './pages/tasks/TasksPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import AttendancePage from './pages/attendance/AttendancePage';
import AttendanceCalendar from './pages/attendance/AttendanceCalendar';
import LeavesPage from './pages/leaves/LeavesPage';
import HolidaysPage from './pages/holidays/HolidaysPage';
import ReportsPage from './pages/reports/ReportsPage';
import EmployeeDailyReport from './pages/reports/EmployeeDailyReport';
import EmployeeMonthlyReport from './pages/reports/EmployeeMonthlyReport';
import LogsPage from './pages/logs/LogsPage';
import EmployeePortal from './pages/portal/EmployeePortal';
import EmployeeTimeline from './pages/attendance/EmployeeTimeline';
import ExecutionPage from './pages/portal/ExecutionPage';

import { GoogleOAuthProvider } from '@react-oauth/google';

function ProtectedRoute({ children, permission, roles }) {
  const { user, loading, hasPermission, hasRole } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  const authorized = (permission ? hasPermission(permission) : true) && 
                    (roles ? hasRole(roles) : true);
                    
  if (!authorized) {
    // Redirect unauthorized users to their portal or leaves page
    return <Navigate to="/portal" replace />;
  }
  
  return children;
}

export default function App() {
  const adminRoles = ['Super Admin', 'Admin', 'HR', 'Manager', 'Supervisor'];
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected — inside MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<ProtectedRoute roles={adminRoles}><Dashboard /></ProtectedRoute>} />
              <Route path="/portal" element={<EmployeePortal />} />
              
              <Route path="/employees" element={<ProtectedRoute roles={adminRoles}><EmployeeList /></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute roles={adminRoles}><DepartmentList /></ProtectedRoute>} />
              <Route path="/teams" element={<ProtectedRoute roles={adminRoles}><TeamList /></ProtectedRoute>} />
              <Route path="/roles" element={<ProtectedRoute roles={['Super Admin', 'Admin']}><RolesList /></ProtectedRoute>} />
              
              {/* Phase 2: Sites & Shifts */}
              <Route path="/shifts" element={<ProtectedRoute roles={adminRoles}><ShiftsPage /></ProtectedRoute>} />
              <Route path="/my-shifts" element={<MyShiftsPage />} />
              <Route path="/shifts/employee/:id" element={<ProtectedRoute roles={adminRoles}><EmployeeShiftPlanner /></ProtectedRoute>} />
              <Route path="/sites" element={<ProtectedRoute roles={adminRoles}><SitesPage /></ProtectedRoute>} />
              <Route path="/sites/new" element={<ProtectedRoute roles={adminRoles}><SitesPage mode="new" /></ProtectedRoute>} />
              <Route path="/sites/in-progress" element={<ProtectedRoute roles={adminRoles}><SitesPage mode="in-progress" /></ProtectedRoute>} />
              <Route path="/sites/completed" element={<ProtectedRoute roles={adminRoles}><SitesPage mode="completed" /></ProtectedRoute>} />
              <Route path="/my-sites" element={<MySitesPage />} />
              <Route path="/my-sites/completed" element={<MySitesPage mode="completed" />} />
              
              {/* Phase 3: Tasks & Expenses */}
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/execution/:type/:id" element={<ExecutionPage />} />
              
              {/* Phase 4: Attendance */}
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/attendance/calendar" element={<AttendanceCalendar />} />
              <Route path="/attendance/timeline/:attendanceId" element={<EmployeeTimeline />} />
              
              {/* Phase 5: Leaves & Holidays */}
              <Route path="/leaves" element={<LeavesPage />} />
              <Route path="/holidays" element={<HolidaysPage />} />
              
              {/* Phase 6: Reports */}
              <Route path="/reports" element={<ProtectedRoute roles={adminRoles}><ReportsPage /></ProtectedRoute>} />
              <Route path="/reports/employee/:id" element={<ProtectedRoute roles={adminRoles}><EmployeeDailyReport /></ProtectedRoute>} />
              <Route path="/reports/employee/:id/monthly" element={<ProtectedRoute roles={adminRoles}><EmployeeMonthlyReport /></ProtectedRoute>} />
              
              {/* Phase 7: Logs */}
              <Route path="/logs" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Manager']}><LogsPage /></ProtectedRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
