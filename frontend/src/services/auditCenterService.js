import apiClient from './api';

export const getLogs = () => apiClient.get('/suite/audit-center/logs');
export const recordAuditLog = (dto) => apiClient.post('/suite/audit-center/logs', dto);
export const exportCsv = () => apiClient.get('/suite/audit-center/export');

