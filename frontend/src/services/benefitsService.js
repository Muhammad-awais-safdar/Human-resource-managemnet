import apiClient from './api';

export const getPlans = () => apiClient.get('/benefits/plans');
export const addPlan = (dto) => apiClient.post('/benefits/plans', dto);
export const getMyEnrollments = () => apiClient.get('/benefits/my-enrollments');
export const getAllEnrollments = () => apiClient.get('/benefits/enrollments');
export const enroll = (planId) => apiClient.post(`/benefits/enroll/${planId}`, {});
export const unenroll = (planId) => apiClient.post(`/benefits/unenroll/${planId}`, {});
