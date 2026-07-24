import apiClient from './api';

export const getSurveys = () => apiClient.get('/suite/engagement/surveys');
export const createSurvey = (dto) => apiClient.post('/suite/engagement/surveys', dto);
export const getRecognitions = () => apiClient.get('/suite/engagement/recognitions');
export const sendRecognition = (dto) => apiClient.post('/suite/engagement/recognitions', dto);
export const getSuggestions = () => apiClient.get('/suite/engagement/suggestions');
export const submitSuggestion = (dto) => apiClient.post('/suite/engagement/suggestions', dto);
