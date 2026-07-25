import apiClient from './api';

export async function getExpenses() {
  return apiClient.get('/suite/expense/claims');
}

export async function submitExpense(claimData) {
  return apiClient.post('/suite/expense/claims', claimData);
}

export async function approveExpense(id) {
  return apiClient.post(`/suite/expense/claims/${id}/approve`, {});
}

export async function rejectExpense(id) {
  return apiClient.post(`/suite/expense/claims/${id}/reject`, {});
}

export async function deleteExpense(id) {
  return apiClient.delete(`/suite/expense/claims/${id}`);
}
