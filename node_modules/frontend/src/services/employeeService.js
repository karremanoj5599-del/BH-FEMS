import api from './api';

const employeeService = {
  getEmployees: (params) => api.get('/employees/', { params }),
  getEmployee: (id) => api.get(`/employees/${id}`),
  createEmployee: (payload) => api.post('/employees/', payload),
  updateEmployee: (id, payload) => api.put(`/employees/${id}`, payload),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),
  exportEmployees: () => api.get('/employees/export-csv', { responseType: 'blob' }),
  importEmployees: (formData) => api.post('/employees/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default employeeService;
