import apiClient from './api';

export const getPlugins = () => apiClient.get('/suite/marketplace/plugins');
export const installPlugin = (dto) => apiClient.post('/suite/marketplace/plugins', dto);
export const togglePlugin = (id, enabled) => apiClient.put(`/suite/marketplace/plugins/${id}/toggle`, { enabled });
export const uninstallPlugin = (id) => apiClient.delete(`/suite/marketplace/plugins/${id}`);

export const uploadPluginBundle = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Custom fetch for multipart file upload
  const token = localStorage.getItem('token');
  const tenant = localStorage.getItem('tenant_subdomain') || 'awais';
  
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenant) headers['X-Tenant'] = tenant;

  const response = await fetch('/api/v1/suite/marketplace/plugins/upload', {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to upload plugin bundle');
  }
  return data;
};
