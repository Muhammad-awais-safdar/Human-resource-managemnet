import apiClient from './api';

export const getSsoConfig = () => apiClient.get('/suite/sso/config');
export const updateSsoConfig = (dto) => apiClient.post('/suite/sso/config', dto);
export const getAuditLogs = () => apiClient.get('/suite/sso/audit');
