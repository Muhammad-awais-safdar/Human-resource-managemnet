import apiClient from '@/core/api/apiClient';

export const recruitmentService = {
  getJobRequisitions: () => apiClient.get('/recruitment/jobs'),
  createJobRequisition: (jobData) => apiClient.post('/recruitment/jobs', jobData),
  getCandidates: (jobId) => apiClient.get(`/recruitment/jobs/${jobId}/candidates`),
};
