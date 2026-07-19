import apiClient from './api';

export const getPositions = () => apiClient.get('/succession/positions');
export const addPosition = (dto) => apiClient.post('/succession/positions', dto);
export const getSuccessionPlans = () => apiClient.get('/succession/plans');
export const addSuccessorToPlan = (dto) => apiClient.post('/succession/plans', dto);
export const getTalentPools = () => apiClient.get('/succession/talent-pools');
export const addTalentPool = (dto) => apiClient.post('/succession/talent-pools', dto);
export const addMemberToPool = (dto) => apiClient.post('/succession/talent-pools/members', dto);
