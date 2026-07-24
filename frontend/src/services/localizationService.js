import apiClient from './api';

export const getLocaleSettings = () => apiClient.get('/suite/localization/settings');
export const updateLocaleSettings = (dto) => apiClient.post('/suite/localization/settings', dto);
