import apiClient from './api';

export const getSaaSOverview = () => apiClient.get('/suite/tenant-analytics/overview');
export const getChurnRisks = () => apiClient.get('/suite/tenant-analytics/churn-risks');
export const recordMetric = (dto) => apiClient.post('/suite/tenant-analytics/metrics', dto);
