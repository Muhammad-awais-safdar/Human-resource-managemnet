import apiClient from './api';

export const getVisitors = () => apiClient.get('/suite/visitors');
export const registerVisitor = (dto) => apiClient.post('/suite/visitors', dto);
export const checkInVisitor = (id) => apiClient.post(`/suite/visitors/${id}/check-in`, {});
export const checkOutVisitor = (id) => apiClient.post(`/suite/visitors/${id}/check-out`, {});
export const updateVisitorStatus = (id, status) => apiClient.post(`/suite/visitors/${id}/status`, { status });
