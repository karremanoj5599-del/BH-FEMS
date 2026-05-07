import api from './api';

const roleService = {
  getRoles: () => api.get('/roles/'),
};

export default roleService;
