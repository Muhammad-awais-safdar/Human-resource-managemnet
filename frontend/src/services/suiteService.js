import apiClient from './api';

// Offboarding Resignations
export const getResignations = () => {
  return apiClient.get('/suite/offboarding/resignations');
};

export const submitResignation = (dto) => {
  return apiClient.post('/suite/offboarding/resignations', dto);
};

export const deleteResignation = (id) => {
  return apiClient.delete(`/suite/offboarding/resignations/${id}`);
};

// Shift Schedules
export const getShifts = () => {
  return apiClient.get('/suite/shifts/schedule');
};

// Holiday Management
export const getHolidays = () => {
  return apiClient.get('/suite/holidays');
};

// Payroll Payslips
export const getPayslips = () => {
  return apiClient.get('/suite/payroll/payslips');
};

// Performance Goals
export const getGoals = () => {
  return apiClient.get('/suite/performance/goals');
};

export const updateGoalProgress = (id, dto) => {
  return apiClient.put(`/suite/performance/goals/${id}`, dto);
};

// Learning LMS
export const getCourses = () => {
  return apiClient.get('/suite/learning/courses');
};

// Expenses claims
export const getExpenses = () => {
  return apiClient.get('/suite/expense/claims');
};

export const submitExpense = (dto) => {
  return apiClient.post('/suite/expense/claims', dto);
};

export const deleteExpense = (id) => {
  return apiClient.delete(`/suite/expense/claims/${id}`);
};

// Travel logs
export const getTravelRequests = () => {
  return apiClient.get('/suite/travel/requests');
};

// Timesheets
export const getProjects = () => {
  return apiClient.get('/suite/projects');
};

export const submitTimesheet = (dto) => {
  return apiClient.post('/suite/projects/timesheets', dto);
};

// Help Desk Support Tickets
export const getTickets = () => {
  return apiClient.get('/suite/tickets');
};

export const submitTicket = (dto) => {
  return apiClient.post('/suite/tickets', dto);
};

export const deleteTicket = (id) => {
  return apiClient.delete(`/suite/tickets/${id}`);
};

// Document Management
export const getDocuments = () => {
  return apiClient.get('/suite/documents');
};

export const uploadDocument = (file, expiryDate) => {
  const formData = new FormData();
  formData.append('file', file);
  if (expiryDate) {
    formData.append('expiryDate', expiryDate);
  }
  return apiClient.post('/suite/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// =========================================================
// Phase 16: Holiday Management
// =========================================================
export const addHoliday = (dto) => apiClient.post('/suite/holidays', dto);
export const getRegionalHolidays = (region) => apiClient.get(`/suite/holidays/regional?region=${region}`);

// =========================================================
// Phase 17: Payroll Engine
// =========================================================
export const runPayroll = () => apiClient.post('/suite/payroll/run');
export const getAllPayslips = () => apiClient.get('/suite/payroll/all');

// =========================================================
// Phase 18: Performance Management
// =========================================================
export const createGoal = (dto) => apiClient.post('/suite/performance/goals', dto);
export const getPeerFeedback = () => apiClient.get('/suite/performance/peer-feedback');
export const submitPeerFeedback = (dto) => apiClient.post('/suite/performance/peer-feedback', dto);

// =========================================================
// Phase 19: Learning Management System
// =========================================================
export const getAllCourses = () => apiClient.get('/suite/learning/courses/all');
export const enrollCourse = (courseId) => apiClient.post(`/suite/learning/courses/${courseId}/enroll`);
export const getCourseQuizzes = (courseId) => apiClient.get(`/suite/learning/courses/${courseId}/quizzes`);
export const submitQuizAnswer = (quizId, answer) =>
  apiClient.post(`/suite/learning/quizzes/${quizId}/answer`, { answer });

// =========================================================
// Phase 20: Asset Management
// =========================================================
export const getAllAssets = () => apiClient.get('/suite/assets');
export const getMyAssets = () => apiClient.get('/suite/assets/my');
export const addAsset = (dto) => apiClient.post('/suite/assets', dto);
export const assignAsset = (assetId, employeeId) =>
  apiClient.post(`/suite/assets/${assetId}/assign`, { employeeId });
export const returnAsset = (assetId) => apiClient.post(`/suite/assets/${assetId}/return`);

// =========================================================
// Phases 21 - 25: Advanced Enterprise Modules
// =========================================================

// Phase 21: Expense Claims Receipt Upload & Admin Approvals
export const uploadReceipt = (expenseId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/suite/expense/claims/${expenseId}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const approveExpense = (expenseId) =>
  apiClient.post(`/suite/expense/claims/${expenseId}/approve`);
export const rejectExpense = (expenseId) =>
  apiClient.post(`/suite/expense/claims/${expenseId}/reject`);

// Phase 22: Travel Requests Create & Approvals
export const submitTravelRequest = (dto) =>
  apiClient.post('/suite/travel/requests', dto);
export const approveTravelRequest = (travelId) =>
  apiClient.post(`/suite/travel/requests/${travelId}/approve`);
export const rejectTravelRequest = (travelId) =>
  apiClient.post(`/suite/travel/requests/${travelId}/reject`);

// Phase 23: Projects Allocations & Timesheets Approvals
export const allocateResource = (dto) =>
  apiClient.post('/suite/projects/allocations', dto);
export const getTimesheets = () =>
  apiClient.get('/suite/projects/timesheets');
export const approveTimesheet = (timesheetId) =>
  apiClient.post(`/suite/projects/timesheets/${timesheetId}/approve`);
export const rejectTimesheet = (timesheetId) =>
  apiClient.post(`/suite/projects/timesheets/${timesheetId}/reject`);

// Phase 24: Support Tickets Assign & Resolve, Knowledge Base
export const assignTicket = (ticketId, assigneeId) =>
  apiClient.post(`/suite/tickets/${ticketId}/assign`, { assigneeId });
export const resolveTicket = (ticketId) =>
  apiClient.post(`/suite/tickets/${ticketId}/resolve`);
export const searchKnowledgeBase = (q) =>
  apiClient.get(`/suite/tickets/kb/search?q=${encodeURIComponent(q)}`);
export const createKnowledgeBaseArticle = (dto) =>
  apiClient.post('/suite/tickets/kb', dto);

// Phase 25: Document Signatures pad & Expiry check
export const signDocument = (documentId, signatureData) =>
  apiClient.post(`/suite/documents/${documentId}/sign`, { signatureData });
export const getExpiredDocuments = () =>
  apiClient.get('/suite/documents/expired');

// =========================================================
// Phase 26: Workflow Engine
// =========================================================
export const getWorkflowDefinitions = () => apiClient.get('/suite/workflows/definitions');
export const createWorkflowDefinition = (dto) => apiClient.post('/suite/workflows/definitions', dto);
export const triggerWorkflow = (id) => apiClient.post(`/suite/workflows/definitions/${id}/trigger`);
export const getWorkflowExecutions = () => apiClient.get('/suite/workflows/executions');
export const advanceWorkflowExecution = (id) => apiClient.put(`/suite/workflows/executions/${id}/advance`);
export const cancelWorkflowExecution = (id) => apiClient.put(`/suite/workflows/executions/${id}/cancel`);

// =========================================================
// Phase 27: Communication & Notifications
// =========================================================
export const getAnnouncements = () => apiClient.get('/suite/communication/announcements');
export const postAnnouncement = (dto) => apiClient.post('/suite/communication/announcements', dto);
export const deleteAnnouncement = (id) => apiClient.delete(`/suite/communication/announcements/${id}`);
export const getNotifications = () => apiClient.get('/suite/communication/notifications');
export const getUnreadNotificationCount = () => apiClient.get('/suite/communication/notifications/unread-count');
export const markNotificationRead = (id) => apiClient.put(`/suite/communication/notifications/${id}/read`);

// =========================================================
// Phase 28: Reports & Analytics
// =========================================================
export const getReportDefinitions = () => apiClient.get('/suite/reports');
export const createReportDefinition = (dto) => apiClient.post('/suite/reports', dto);
export const runReport = (id, params) => apiClient.post(`/suite/reports/${id}/run`, params || {});
export const exportReportCsv = (id, params) =>
  apiClient.post(`/suite/reports/${id}/export/csv`, params || {}, { responseType: 'blob' });
export const getDashboardMetrics = () => apiClient.get('/suite/reports/dashboard/metrics');

// =========================================================
// Phase 29: Integrations & Webhooks
// =========================================================
export const getIntegrations = () => apiClient.get('/suite/integrations');
export const upsertIntegration = (dto) => apiClient.post('/suite/integrations', dto);
export const toggleIntegration = (id, active) => apiClient.put(`/suite/integrations/${id}/toggle`, { active });
export const getWebhooks = () => apiClient.get('/suite/integrations/webhooks');
export const addWebhook = (dto) => apiClient.post('/suite/integrations/webhooks', dto);
export const deleteWebhook = (id) => apiClient.delete(`/suite/integrations/webhooks/${id}`);

// =========================================================
// Phase 30: Mobile Platform Sync
// =========================================================
export const registerMobileDevice = (dto) => apiClient.post('/suite/mobile/register', dto);
export const getMobileSyncDelta = (deviceToken) =>
  apiClient.get(`/suite/mobile/sync?deviceToken=${encodeURIComponent(deviceToken)}`);
export const pushMobileDelta = (dto) => apiClient.post('/suite/mobile/sync/push', dto);
export const getMobileDevices = () => apiClient.get('/suite/mobile/devices');
export const deregisterMobileDevice = (deviceToken) =>
  apiClient.delete(`/suite/mobile/deregister?deviceToken=${encodeURIComponent(deviceToken)}`);

// =========================================================
// Phase 31: AI & Automation
// =========================================================
export const getAnomalies = () => apiClient.get('/suite/ai/anomalies');
export const detectAnomalies = () => apiClient.post('/suite/ai/anomalies/detect');
export const getCandidateFit = (candidateId) => apiClient.get(`/suite/ai/candidates/${candidateId}/fit`);
export const getAttritionRisk = (employeeId) => apiClient.get(`/suite/ai/employees/${employeeId}/attrition`);

// =========================================================
// Phase 32: Compliance & Governance
// =========================================================
export const saveGdprConsent = (dto) => apiClient.post('/suite/compliance/consent', dto);
export const getGdprConsent = () => apiClient.get('/suite/compliance/consent');
export const getAuditLogs = () => apiClient.get('/suite/compliance/audits');
export const runCompliancePurge = () => apiClient.post('/suite/compliance/purge');

// =========================================================
// Phase 33: Platform Settings
// =========================================================
export const getPlatformSettings = () => apiClient.get('/suite/settings');
export const updatePlatformSettings = (dto) => apiClient.put('/suite/settings', dto);

// =========================================================
// Phase 34: Enterprise Features
// =========================================================
export const generateApiKey = (dto) => apiClient.post('/suite/enterprise/keys', dto);
export const getApiKeys = () => apiClient.get('/suite/enterprise/keys');
export const revokeApiKey = (id) => apiClient.delete(`/suite/enterprise/keys/${id}`);
export const triggerBackup = () => apiClient.post('/suite/enterprise/backups');
export const getBackups = () => apiClient.get('/suite/enterprise/backups');
