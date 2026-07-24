import apiClient from './api';

export const getMyNotifications = () => apiClient.get('/suite/smart-notifications/mine');
export const markAllRead = () => apiClient.post('/suite/smart-notifications/read-all');
export const getPreferences = () => apiClient.get('/suite/smart-notifications/preferences');
export const updatePreferences = (dto) => apiClient.post('/suite/smart-notifications/preferences', dto);
