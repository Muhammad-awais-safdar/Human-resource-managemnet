import apiClient from '@/core/api/apiClient';

export const payrollService = {
  getPayrollRuns: () => apiClient.get('/payroll/runs'),
  executePayrollRun: (runData) => apiClient.post('/payroll/runs', runData),
  getPayslip: (id) => apiClient.get(`/payroll/payslips/${id}`),
};
