import apiClient from './api';

export const getInterviews = () => apiClient.get('/suite/recruitment-ext/interviews');
export const scheduleInterview = (dto) => apiClient.post('/suite/recruitment-ext/interviews', dto);
export const getOffers = () => apiClient.get('/suite/recruitment-ext/offers');
export const createOffer = (dto) => apiClient.post('/suite/recruitment-ext/offers', dto);
