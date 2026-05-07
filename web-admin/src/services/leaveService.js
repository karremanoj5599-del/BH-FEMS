import api from './api';

const leaveService = {
  getLeaves: (params) => api.get('/leaves/', { params }),
  applyLeave: (payload) => api.post('/leaves/', payload),
  getLeaveBalances: (params) => api.get('/leaves/balances', { params }),
  getLeaveTypes: () => api.get('/leaves/types'),
  createLeaveType: (payload) => api.post('/leaves/types', payload),
  updateLeaveStatus: (leaveId, status) => api.put(`/leaves/${leaveId}/status`, null, { params: { new_status: status } }),
  getCoverage: () => api.get('/leaves/coverage'),
  getCompOffEarnings: () => api.get('/leaves/comp-off-earnings'),
};

export default leaveService;
