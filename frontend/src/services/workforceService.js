import apiClient from './api';

export const getSchedules = () => apiClient.get('/workforce/schedules');
export const createSchedule = (dto) => apiClient.post('/workforce/schedules', dto);
export const getOpenShifts = () => apiClient.get('/workforce/open-shifts');
export const createOpenShift = (dto) => apiClient.post('/workforce/open-shifts', dto);
export const bidOnShift = (openShiftId) => apiClient.post(`/workforce/open-shifts/${openShiftId}/bid`, {});
export const actionBid = (bidId, status) => apiClient.post(`/workforce/bids/${bidId}/action`, { status });

// Phase 35: Workforce Planning Endpoints
export const getPlans = () => apiClient.get('/suite/workforce-planning/plans');
export const createPlan = (dto) => apiClient.post('/suite/workforce-planning/plans', dto);
export const getPositionBudgets = (planId) => apiClient.get(`/suite/workforce-planning/plans/${planId}/budgets`);
export const addPositionBudget = (planId, dto) => apiClient.post(`/suite/workforce-planning/plans/${planId}/budgets`, dto);
export const getForecastScenarios = (planId) => apiClient.get(`/suite/workforce-planning/plans/${planId}/scenarios`);
export const createForecastScenario = (planId, dto) => apiClient.post(`/suite/workforce-planning/plans/${planId}/scenarios`, dto);
export const getPlanningAnalytics = (planId) => apiClient.get(`/suite/workforce-planning/plans/${planId}/analytics`);
