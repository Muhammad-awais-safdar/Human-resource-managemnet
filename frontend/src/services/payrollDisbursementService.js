import api from './api';

export const payrollDisbursementService = {
  configureProvider: async (payload) => {
    const res = await api.post('/suite/payroll-disbursement/config', payload);
    return res.data;
  },

  executeDisbursement: async (batchId, payload, idempotencyKey) => {
    const headers = idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {};
    const res = await api.post(`/suite/payroll-disbursement/batches/${batchId}/disburse`, payload, { headers });
    return res.data;
  },

  getBatchStatus: async (batchId) => {
    const res = await api.get(`/suite/payroll-disbursement/batches/${batchId}/status`);
    return res.data;
  }
};

export default payrollDisbursementService;
