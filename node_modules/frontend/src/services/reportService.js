import api from './api';

const reportService = {
  /**
   * Get main reports overview dashboard data
   * @param {string} date - Optional date filter (YYYY-MM-DD)
   */
  getOverview: (date = null) => {
    return api.get('/reports/overview', { params: { date } });
  },

  /**
   * Get daily reports for all employees
   */
  getEmployeeDaily: (date = null) => {
    return api.get('/reports/employee-daily', { params: { date } });
  },

  /**
   * Get monthly aggregation reports
   */
  getEmployeeMonthly: (month = null, year = null) => {
    return api.get('/reports/employee-monthly', { params: { month, year } });
  },

  /**
   * Get detailed audit logs for a specific employee
   */
  getEmployeeAudit: (employeeId, date = null) => {
    return api.get(`/reports/employee/${employeeId}/audit`, { params: { date } });
  }
};

export default reportService;
