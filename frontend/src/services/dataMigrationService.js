import apiClient from './api';

export const getMigrationJobs = () => apiClient.get('/suite/data-migration/jobs');
export const executeMigrationJob = (dto) => apiClient.post('/suite/data-migration/execute', dto);
