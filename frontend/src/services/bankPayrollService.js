import apiClient from './api';

export const getBankBatches = () => apiClient.get('/suite/bank-payroll/batches');
export const createBatch = (dto) => apiClient.post('/suite/bank-payroll/batches', dto);
export const exportFile = (batchId, format) => apiClient.post(`/suite/bank-payroll/batches/${batchId}/export?format=${format}`);
