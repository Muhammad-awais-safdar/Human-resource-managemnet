// Resolve context versioning parameters dynamically
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `/api/${API_VERSION}`;

// Recursive key casing conversion helpers
const snakeToCamel = (str) => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

const convertKeysToCamel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamel(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeToCamel(key)]: convertKeysToCamel(obj[key]),
      }),
      {}
    );
  }
  return obj;
};

// Helper to extract subdomain context dynamically from browser location
const getSubdomain = () => {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Local development (e.g., acme.localhost)
  if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
    return parts[0] !== 'localhost' ? parts[0] : null;
  }
  
  // Production / Staging (e.g., acme.awais-hr.com)
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
};

// Generic fetch wrapper replicating request/response interceptors natively
const customFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Inject Authorization and X-Tenant headers
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const tenant = getSubdomain();
    if (tenant) {
      headers['X-Tenant'] = tenant;
    }
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Handle unauthorized responses (401)
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  // Parse JSON response body safely
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = text;
  }

  // Unpack unified ApiResponse envelope if present
  if (data && data.hasOwnProperty('result') && data.hasOwnProperty('statusCode')) {
    if (data.statusCode !== 200) {
      throw new Error(data.statusMessage || 'API Error');
    }
    return convertKeysToCamel(data.result);
  }

  // Check HTTP response status
  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'Request failed');
  }

  return convertKeysToCamel(data);
};

// Expose same interface for drop-in replacement compatibility
const apiClient = {
  get: (url, options) => customFetch(url, { method: 'GET', ...options }),
  post: (url, body, options) => customFetch(url, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (url, body, options) => customFetch(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (url, options) => customFetch(url, { method: 'DELETE', ...options }),
};

export default apiClient;
