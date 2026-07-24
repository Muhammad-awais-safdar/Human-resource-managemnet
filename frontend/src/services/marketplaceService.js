import apiClient from './api';

export const getPlugins = () => apiClient.get('/suite/marketplace/plugins');
export const installPlugin = (dto) => apiClient.post('/suite/marketplace/plugins', dto);
