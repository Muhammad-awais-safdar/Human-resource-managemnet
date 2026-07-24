import apiClient from './api';

export const getFeedPosts = () => apiClient.get('/suite/internal-communication/posts');
export const createFeedPost = (dto) => apiClient.post('/suite/internal-communication/posts', dto);
export const getPolls = () => apiClient.get('/suite/internal-communication/polls');
export const createPoll = (dto) => apiClient.post('/suite/internal-communication/polls', dto);
