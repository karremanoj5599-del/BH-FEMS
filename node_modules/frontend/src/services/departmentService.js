import api from './api';

const departmentService = {
  getDepartments: () => api.get('/departments/'),
  getDepartment: (id) => api.get(`/departments/${id}`),
};

export default departmentService;
