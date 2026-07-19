import apiClient from './api';

export const getSchedules = () => apiClient.get('/workforce/schedules');
export const createSchedule = (dto) => apiClient.post('/workforce/schedules', dto);
export const getOpenShifts = () => apiClient.get('/workforce/open-shifts');
export const createOpenShift = (dto) => apiClient.post('/workforce/open-shifts', dto);
export const bidOnShift = (openShiftId) => apiClient.post(`/workforce/open-shifts/${openShiftId}/bid`, {});
export const actionBid = (bidId, status) => apiClient.post(`/workforce/bids/${bidId}/action`, { status });
