import apiClient from './api';

export const getPendingCounts = () => apiClient.get('/suite/approvals/counts');
export const getDelegations = () => apiClient.get('/suite/approvals/delegations');
export const delegateApproval = (dto) => apiClient.post('/suite/approvals/delegate', dto);
