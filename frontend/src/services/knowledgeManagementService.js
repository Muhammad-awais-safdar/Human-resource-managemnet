import apiClient from './api';

export const getArticles = () => apiClient.get('/suite/knowledge-management/articles');
export const createArticle = (dto) => apiClient.post('/suite/knowledge-management/articles', dto);
export const getSops = () => apiClient.get('/suite/knowledge-management/sops');
export const createSop = (dto) => apiClient.post('/suite/knowledge-management/sops', dto);
