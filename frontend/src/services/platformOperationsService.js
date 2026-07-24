import apiClient from './api';

export const getLogs = (params) => apiClient.get('/suite/observability/logs', { params });
export const recordLog = (dto) => apiClient.post('/suite/observability/logs', dto);
export const getTailLogs = (lines = 330) => apiClient.get(`/suite/observability/logs/tail?lines=${lines}`);
export const getSecurityEvents = (params) => apiClient.get('/suite/observability/security-events', { params });
export const getExceptions = (params) => apiClient.get('/suite/observability/exceptions', { params });
export const getAlerts = () => apiClient.get('/suite/observability/alerts');
export const createAlert = (dto) => apiClient.post('/suite/observability/alerts', dto);
