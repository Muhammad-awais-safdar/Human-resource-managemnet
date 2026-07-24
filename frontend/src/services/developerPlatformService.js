import apiClient from './api';

export const getWebhooks = () => apiClient.get('/suite/developer-platform/webhooks');
export const registerWebhook = (dto) => apiClient.post('/suite/developer-platform/webhooks', dto);
