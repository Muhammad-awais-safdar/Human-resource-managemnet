import apiClient from './api';

export const getComponents = () => apiClient.get('/suite/salary-structure/components');
export const createComponent = (dto) => apiClient.post('/suite/salary-structure/components', dto);
export const getTemplates = () => apiClient.get('/suite/salary-structure/templates');
