import apiClient from '@/core/api/apiClient';

export const essService = {
  getMyProfile: () => apiClient.get('/ess/profile'),
  updateMyProfile: (data) => apiClient.put('/ess/profile', data),
  getMyPayslips: () => apiClient.get('/ess/payslips'),
  getMyTaxForms: () => apiClient.get('/ess/tax-forms'),
};
