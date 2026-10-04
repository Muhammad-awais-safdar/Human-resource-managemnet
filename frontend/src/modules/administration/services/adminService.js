import apiClient from '@/core/api/apiClient';

export const adminService = {
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
  getRoles: () => apiClient.get('/admin/roles'),
  createRole: (roleData) => apiClient.post('/admin/roles', roleData),
  getTenants: () => apiClient.get('/admin/tenants'),
  provisionTenant: (tenantData) => apiClient.post('/admin/tenants', tenantData),
  getTelemetryMetrics: () => apiClient.get('/admin/telemetry'),
};
