import api from './api';

const shiftService = {
  getShifts: (params) => api.get('/shifts/', { params }),
  assignShift: (payload) => api.post('/shifts/', payload),
  bulkAssignShifts: (payload) => api.post('/shifts/bulk', payload),
  getMyShifts: (params) => api.get('/shifts/my', { params }),
  
  getShiftTypes: () => api.get('/shifts/types'),
  createShiftType: (payload) => api.post('/shifts/types', payload),
  updateShiftType: (id, payload) => api.put(`/shifts/types/${id}`, payload),
  deleteShiftType: (id) => api.delete(`/shifts/types/${id}`),
  
  getPolicies: () => api.get('/shifts/policies'),
  createPolicy: (payload) => api.post('/shifts/policies', payload),
  updatePolicy: (id, payload) => api.put(`/shifts/policies/${id}`, payload),
  deletePolicy: (id) => api.delete(`/shifts/policies/${id}`),
};

export default shiftService;
