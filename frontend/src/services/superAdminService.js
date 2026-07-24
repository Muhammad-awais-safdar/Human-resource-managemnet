import apiClient from './api';

export const getLogs = () => apiClient.get('/suite/superadmin/logs');
export const logTenantAction = (dto) => apiClient.post('/suite/superadmin/logs', dto);
