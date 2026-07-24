import apiClient from './api';

export const getIncidents = () => apiClient.get('/suite/health-safety/incidents');
export const reportIncident = (dto) => apiClient.post('/suite/health-safety/incidents', dto);
export const getPpeAssignments = () => apiClient.get('/suite/health-safety/ppe');
export const assignPpe = (dto) => apiClient.post('/suite/health-safety/ppe', dto);
