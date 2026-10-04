import apiClient from '@/core/api/apiClient';

export const performanceService = {
  getReviews: () => apiClient.get('/performance/reviews'),
  submitReview: (data) => apiClient.post('/performance/reviews', data),
  getOkrs: () => apiClient.get('/performance/okrs'),
};
