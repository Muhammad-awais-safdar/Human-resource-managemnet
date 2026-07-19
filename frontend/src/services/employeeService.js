import apiClient from './api';

export const listEmployees = () => {
  return apiClient.get('/employee/list');
};

export const getTimeline = () => {
  return apiClient.get('/employee/timeline');
};

export const addTimelineEvent = (dto) => {
  return apiClient.post('/employee/timeline', dto);
};

export const getExitClearances = () => {
  return apiClient.get('/employee/clearance');
};

export const initiateClearance = (employeeId) => {
  return apiClient.post('/employee/clearance', { employeeId });
};

export const approveClearance = (clearanceId, department) => {
  return apiClient.post('/employee/clearance/approve', { clearanceId, department });
};

export const getEmployeeInfo = (id) => {
  return apiClient.get(`/employee/${id}/info`);
};

export const updateEmployeeInfo = (id, dto) => {
  return apiClient.put(`/employee/${id}/info`, dto);
};

export const inviteEmployee = (dto) => {
  return apiClient.post('/employee/invite', dto);
};

export const updateEmployeeRole = (id, roleId) => {
  return apiClient.put(`/employee/${id}/role`, { roleId });
};

export const getEmployee360 = (id) => {
  return apiClient.get(`/employee/${id}/360`);
};


