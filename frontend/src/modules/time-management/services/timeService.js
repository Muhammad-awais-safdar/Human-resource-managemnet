import apiClient from '@/core/api/apiClient';

export const timeService = {
  getLeaves: () => apiClient.get('/time/leaves'),
  requestLeave: (leaveData) => apiClient.post('/time/leaves', leaveData),
  getExpenses: () => apiClient.get('/time/expenses'),
  submitExpense: (expenseData) => apiClient.post('/time/expenses', expenseData),
};
