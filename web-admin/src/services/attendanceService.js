import api from './api';

const attendanceService = {
  checkIn: (payload) => api.post('/attendance/check-in', payload),
  checkOut: (payload) => api.post('/attendance/check-out', payload),
  getAttendanceStatus: () => api.get('/attendance/status'),
  getLiveAttendance: () => api.get('/attendance/live'),
  getAttendanceHistory: (params) => api.get('/attendance/', { params }),
  getMyAttendance: (params) => api.get('/attendance/me', { params }),
  syncLocation: (payload) => api.post('/attendance/sync-location', payload),
  
  // Site execution
  startSiteSession: (params) => api.post('/attendance/site/start', null, { params }),
  siteCheckIn: (id) => api.post(`/attendance/site/${id}/check-in`),
  siteComplete: (id, params) => api.post(`/attendance/site/${id}/complete`, null, { params }),
  siteCheckOut: (id) => api.post(`/attendance/site/${id}/check-out`),
  getActiveSessions: () => api.get('/attendance/site/active-sessions'),
};

export default attendanceService;
