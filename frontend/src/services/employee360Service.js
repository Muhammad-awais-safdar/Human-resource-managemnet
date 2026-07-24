import apiClient from './api';

export const get360Profile = (employeeId) => apiClient.get(`/suite/employee-360/${employeeId}`);
export const addManagerNote = (dto) => apiClient.post('/suite/employee-360/manager-notes', dto);
