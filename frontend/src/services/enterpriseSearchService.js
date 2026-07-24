import apiClient from './api';

export const searchEntities = (query) => apiClient.get('/suite/search', { params: { q: query } });
export const indexEntity = (dto) => apiClient.post('/suite/search/index', dto);
