import apiClient from '../../../services/api';

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  async registerTenant(registrationData) {
    return apiClient.post('/tenants/register', registrationData);
  },

  async registerEmployee(employeeData) {
    return apiClient.post('/auth/register-employee', employeeData);
  },

  logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
};
