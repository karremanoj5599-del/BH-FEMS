import api from './api';

const siteService = {
  getSites: (params) => api.get('/sites', { params }),
  getSite: (id) => api.get(`/sites/${id}`),
  createSite: (payload) => api.post('/sites', payload),
  updateSite: (id, payload) => api.put(`/sites/${id}`, payload),
  deleteSite: (id) => api.delete(`/sites/${id}`),
  getSiteIssues: (id) => api.get(`/sites/${id}/issues`),
};

export default siteService;
