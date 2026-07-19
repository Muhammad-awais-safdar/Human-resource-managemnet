import apiClient from '../../../services/api';

export const employeeService = {
  async getEmployees(params = {}) {
    return apiClient.get('/employees', { params });
  },

  async getEmployeeById(id) {
    return apiClient.get(`/employees/${id}`);
  },

  async createEmployee(employeeData) {
    return apiClient.post('/employees', employeeData);
  },

  async updateEmployee(id, employeeData) {
    return apiClient.put(`/employees/${id}`, employeeData);
  },

  async deleteEmployee(id) {
    return apiClient.delete(`/employees/${id}`);
  }
};
