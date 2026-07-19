import apiClient from './api';

export const getContractors = () => apiClient.get('/contractor/contractors');
export const addContractor = (dto) => apiClient.post('/contractor/contractors', dto);
export const getAgreements = (contractorId) => apiClient.get(`/contractor/contractors/${contractorId}/agreements`);
export const addAgreement = (dto) => apiClient.post('/contractor/agreements', dto);
export const getTimesheets = (contractorId) => apiClient.get(`/contractor/contractors/${contractorId}/timesheets`);
export const submitTimesheet = (dto) => apiClient.post('/contractor/timesheets', dto);
export const actionTimesheet = (timesheetId, status) => apiClient.post(`/contractor/timesheets/${timesheetId}/action`, { status });
