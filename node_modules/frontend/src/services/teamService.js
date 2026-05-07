import api from './api';

const teamService = {
  getTeams: () => api.get('/teams/'),
};

export default teamService;
