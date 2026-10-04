import apiClient from '@/core/api/apiClient';

export const dashboardService = {
  getOverviewMetrics: () => apiClient.get('/suite/dashboard/metrics'),
  getWorkforceSummary: () => apiClient.get('/suite/dashboard/workforce'),
  getQuickActions: () => apiClient.get('/suite/dashboard/quick-actions'),
};
