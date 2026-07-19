import apiClient from './api';

export const getTasks = () => {
  return apiClient.get('/onboarding/tasks');
};

export const completeTask = (id) => {
  return apiClient.post(`/onboarding/tasks/${id}/complete`);
};

export const getAssets = () => {
  return apiClient.get('/onboarding/assets');
};

export const logSignature = (dto) => {
  return apiClient.post('/onboarding/signature', dto);
};
