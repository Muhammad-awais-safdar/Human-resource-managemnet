import apiClient from './api';

export const getChecklists = () => apiClient.get('/suite/compliance-management/checklists');
export const createChecklist = (dto) => apiClient.post('/suite/compliance-management/checklists', dto);
export const getRiskAssessments = () => apiClient.get('/suite/compliance-management/risks');
export const createRiskAssessment = (dto) => apiClient.post('/suite/compliance-management/risks', dto);
export const getPolicyAcknowledgements = () => apiClient.get('/suite/compliance-management/acknowledgements');
export const acknowledgePolicy = (dto) => apiClient.post('/suite/compliance-management/acknowledge', dto);
