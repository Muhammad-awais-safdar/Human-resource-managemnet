import apiClient from './api';

export const getPolicies = () => {
  return apiClient.get('/leaves/policies');
};

export const getRequests = () => {
  return apiClient.get('/leaves/requests');
};

export const submitRequest = (dto) => {
  return apiClient.post('/leaves/requests', dto);
};

export const updateRequestStatus = (id, dto) => {
  return apiClient.put(`/leaves/requests/${id}/status`, dto);
};

export const deleteRequest = (id) => {
  return apiClient.delete(`/leaves/requests/${id}`);
};
