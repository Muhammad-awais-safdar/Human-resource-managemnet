import axios from 'axios';

const baseURL = import.meta.env?.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const tenantId = localStorage.getItem('tenant_id');
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }

      let subdomain = config.headers['X-Tenant-Subdomain'] || localStorage.getItem('tenant_subdomain');
      if (!subdomain) {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 1) {
          const sub = parts[0].toLowerCase();
          if (sub !== 'localhost' && sub !== 'www' && sub !== 'app') {
            subdomain = sub;
          }
        }
      }

      if (subdomain) {
        config.headers['X-Tenant-Subdomain'] = subdomain;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'API request failed';

    if (status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=1';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
