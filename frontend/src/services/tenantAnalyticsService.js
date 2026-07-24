import apiClient from './api';

export const getSaaSOverview = () => apiClient.get('/suite/tenant-analytics/overview');
export const getTenantMetrics = () => apiClient.get('/suite/tenant-analytics/tenant-metrics');
export const recordMetric = (dto) => apiClient.post('/suite/tenant-analytics/metrics', dto);
