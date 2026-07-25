import apiClient from './api';

export async function getLogs() {
  return apiClient.get('/suite/superadmin/logs');
}

export async function logTenantAction(actionData) {
  return apiClient.post('/suite/superadmin/logs', actionData);
}

export async function getTenantDeepDive() {
  return apiClient.get('/suite/superadmin/tenants/deep-dive');
}

export async function updateTenantStatus(id, status) {
  return apiClient.post(`/suite/superadmin/tenants/${id}/status`, { status });
}

export async function extendTenantSubscription(id, days = 30) {
  return apiClient.post(`/suite/superadmin/tenants/${id}/extend-subscription`, { days });
}

export async function getTenantUsers(id) {
  return apiClient.get(`/suite/superadmin/tenants/${id}/users`);
}
