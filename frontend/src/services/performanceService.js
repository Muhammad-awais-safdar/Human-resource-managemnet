import apiClient from './api';

export async function getGoals() {
  return apiClient.get('/suite/performance/goals');
}

export async function createGoal(goalData) {
  return apiClient.post('/suite/performance/goals', goalData);
}

export async function updateGoalProgress(id, progress) {
  return apiClient.put(`/suite/performance/goals/${id}`, { currentValue: progress });
}

export async function getPeerFeedback() {
  return apiClient.get('/suite/performance/peer-feedback');
}

export async function submitPeerFeedback(feedbackData) {
  return apiClient.post('/suite/performance/peer-feedback', feedbackData);
}
