import apiClient from './api';

export const getMetricSnapshots = () => apiClient.get('/suite/analytics/metrics');
export const recordMetricSnapshot = (dto) => apiClient.post('/suite/analytics/metrics', dto);
export const getAttritionTrends = () => apiClient.get('/suite/analytics/attrition');
export const recordAttritionTrend = (dto) => apiClient.post('/suite/analytics/attrition', dto);
