import apiClient from './api';

export const getAdminSettings = () => apiClient.get('/suite/enterprise-admin/settings');
export const updateAdminSettings = (dto) => apiClient.post('/suite/enterprise-admin/settings', dto);
