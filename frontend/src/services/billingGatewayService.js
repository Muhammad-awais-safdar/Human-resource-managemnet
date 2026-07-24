import api from './api';

export const billingGatewayService = {
  getPlans: async () => {
    const res = await api.get('/suite/billing/plans');
    return res.data;
  },

  createCheckoutSession: async (payload) => {
    const res = await api.post('/suite/billing/checkout', payload);
    return res.data;
  },

  issueCreditNote: async (payload) => {
    const res = await api.post('/suite/billing/credit-notes', payload);
    return res.data;
  },

  getSubscription: async () => {
    const res = await api.get('/suite/billing/subscription');
    return res.data;
  },

  getInvoices: async () => {
    const res = await api.get('/suite/billing/invoices');
    return res.data;
  }
};

export default billingGatewayService;
