import apiClient from './api';

export const getSessions = () => apiClient.get('/suite/ai-copilot/sessions');
export const askCopilot = (dto) => apiClient.post('/suite/ai-copilot/ask', dto);
