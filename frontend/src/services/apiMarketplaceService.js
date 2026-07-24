import apiClient from './api';

export const getApiKeys = () => apiClient.get('/suite/api-marketplace/keys');
export const generateApiKey = (dto) => apiClient.post('/suite/api-marketplace/keys', dto);
