import apiClient from '@/core/api/apiClient';

export const approvalService = {
  getPendingApprovals: () => apiClient.get('/suite/approvals/pending'),
  approveRequest: (id) => apiClient.post(`/suite/approvals/${id}/approve`),
  rejectRequest: (id, reason) => apiClient.post(`/suite/approvals/${id}/reject`, { reason }),
};
