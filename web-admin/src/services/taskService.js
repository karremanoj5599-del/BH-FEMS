import api from './api';

const taskService = {
  getTasks: (params) => api.get('/tasks/', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (payload) => api.post('/tasks/', payload),
  updateTask: (id, payload) => api.put(`/tasks/${id}`, payload),
  patchTask: (id, payload) => api.patch(`/tasks/${id}`, payload),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getExecutionReport: (id) => api.get(`/tasks/${id}/execution-report`),
  logMaterialUsage: (id, payload) => api.post(`/tasks/${id}/materials`, payload),
  createProgress: (id, payload) => api.post(`/tasks/${id}/progress`, payload),
};

export default taskService;
