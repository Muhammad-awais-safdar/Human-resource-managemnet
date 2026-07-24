import apiClient from './api';

export const getLogs = () => apiClient.get('/suite/platform-operations/logs');
export const recordLog = (dto) => apiClient.post('/suite/platform-operations/logs', dto);
