import apiClient from './api';

export const getJobs = () => {
  return apiClient.get('/recruitment/jobs');
};

export const createJob = (dto) => {
  return apiClient.post('/recruitment/jobs', dto);
};

export const getCandidates = () => {
  return apiClient.get('/recruitment/candidates');
};

export const updateCandidateStage = (id, dto) => {
  return apiClient.put(`/recruitment/candidates/${id}/stage`, dto);
};

export const deleteCandidate = (id) => {
  return apiClient.delete(`/recruitment/candidates/${id}`);
};

export const applyToJob = (dto) => {
  return apiClient.post('/recruitment/apply', dto);
};
