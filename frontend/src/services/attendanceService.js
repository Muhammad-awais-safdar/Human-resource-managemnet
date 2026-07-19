import apiClient from './api';

export const getAttendanceHistory = () => {
  return apiClient.get('/attendance');
};

export const checkIn = (dto) => {
  return apiClient.post('/attendance/checkin', dto);
};

export const checkOut = () => {
  return apiClient.post('/attendance/checkout');
};

export const deleteAttendance = (id) => {
  return apiClient.delete(`/attendance/${id}`);
};
