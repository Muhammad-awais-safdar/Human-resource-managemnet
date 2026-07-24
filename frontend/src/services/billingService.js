import apiClient from './api';

export const getSubscription = () => apiClient.get('/suite/billing/subscription');
export const updatePlan = (dto) => apiClient.post('/suite/billing/subscription', dto);
export const getInvoices = () => apiClient.get('/suite/billing/invoices');
