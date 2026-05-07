import api from './api';

const expenseService = {
  getExpenses: (params) => api.get('/expenses/', { params }),
  getExpense: (id) => api.get(`/expenses/${id}`),
  submitExpense: (payload) => api.post('/expenses/', payload),
  submitBulkExpenses: (payload) => api.post('/expenses/bulk', payload),
  updateExpenseStatus: (id, status) => api.patch(`/expenses/${id}`, { status }),
  updateExpense: (id, payload) => api.put(`/expenses/${id}`, payload),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  approveExpense: (id, payload) => api.post(`/expenses/${id}/approve`, payload),
};

export default expenseService;
