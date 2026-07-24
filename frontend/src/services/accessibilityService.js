import apiClient from './api';

export const getPreferences = () => apiClient.get('/suite/accessibility/preferences');
export const updatePreferences = (dto) => apiClient.post('/suite/accessibility/preferences', dto);
