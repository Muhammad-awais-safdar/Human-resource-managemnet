import apiClient from './api';

export const getBands = () => apiClient.get('/compensation/bands');
export const addBand = (dto) => apiClient.post('/compensation/bands', dto);
export const getSalaryReviews = () => apiClient.get('/compensation/reviews');
export const submitReview = (dto) => apiClient.post('/compensation/reviews', dto);
export const actionReview = (id, status) => apiClient.post(`/compensation/reviews/${id}/action`, { status });
