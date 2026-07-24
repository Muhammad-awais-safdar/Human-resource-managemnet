import apiClient from './api';

export const getDevices = () => apiClient.get('/suite/mobile-enterprise/devices');
export const registerDevice = (dto) => apiClient.post('/suite/mobile-enterprise/devices', dto);
