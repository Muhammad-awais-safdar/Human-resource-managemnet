import apiClient from './api';

export const getBackups = () => apiClient.get('/suite/business-continuity/backups');
export const triggerBackup = (dto) => apiClient.post('/suite/business-continuity/backups', dto);
