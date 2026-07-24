import apiClient from './api';

export const getCareerPaths = () => apiClient.get('/suite/career-development/paths');
export const createCareerPath = (dto) => apiClient.post('/suite/career-development/paths', dto);
export const getMentorshipPairs = () => apiClient.get('/suite/career-development/mentorship');
export const createMentorshipPair = (dto) => apiClient.post('/suite/career-development/mentorship', dto);
export const getDevelopmentPlans = () => apiClient.get('/suite/career-development/plans');
export const createDevelopmentPlan = (dto) => apiClient.post('/suite/career-development/plans', dto);
