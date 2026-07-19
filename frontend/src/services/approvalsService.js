import apiClient from './api';

export const getPendingApprovals = () => {
  return apiClient.get('/approvals/pending');
};

export const actionApproval = (type, id, action, comment = '') => {
  return apiClient.post(`/approvals/${type}/${id}/action`, { action, comment });
};
