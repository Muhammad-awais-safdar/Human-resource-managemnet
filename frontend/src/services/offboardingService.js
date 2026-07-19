import apiClient from './api';

export const getResignations = () => apiClient.get('/suite/offboarding/resignations');

export const submitResignation = (dto) => apiClient.post('/suite/offboarding/resignations', dto);

export const deleteResignation = (id) => apiClient.delete(`/suite/offboarding/resignations/${id}`);

export const settleResignation = (id, exitFeedback, settlementAmount) =>
  apiClient.post(`/suite/offboarding/resignations/${id}/settle?exitFeedback=${encodeURIComponent(exitFeedback)}&settlementAmount=${settlementAmount}`, {});
