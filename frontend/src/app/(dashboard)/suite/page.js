'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as suiteService from '../../../services/suiteService';
import styles from '../../../modules/auth/styles/register.module.css';

const TABS = [
  { id: 'payroll', name: '💰 Payroll & Payslips' },
  { id: 'performance', name: '📈 Performance Goals' },
  { id: 'lms', name: '🎓 Learning Portal' },
  { id: 'expenses', name: '💸 Expenses & Travel' },
  { id: 'timesheets', name: '📅 Timesheets & Support' },
  { id: 'documents', name: '🗄️ Document Center' },
  { id: 'offboarding', name: '🚪 Offboarding' },
  { id: 'workflows', name: '🔄 Workflow Engine' },
  { id: 'communication', name: '📣 Communication' },
  { id: 'reports', name: '📊 Reports & Analytics' },
  { id: 'integrations', name: '🔗 Integrations' },
  { id: 'mobile', name: '📱 Mobile Platform' },
  { id: 'ai', name: '🤖 AI & Automation' },
  { id: 'compliance', name: '🛡️ Compliance & Audits' },
  { id: 'settings', name: '⚙️ Platform Settings' },
  { id: 'enterprise', name: '🏢 Enterprise Console' }
];

export default function SuitePortalPage() {
  const [activeTab, setActiveTab] = useState('payroll');

  // Module States
  const [payslips, setPayslips] = useState([]);
  const [goals, setGoals] = useState([]);
  const [courses, setCourses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [travel, setTravel] = useState([]);
  const [projects, setProjects] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [kbQuery, setKbQuery] = useState('');
  const [kbArticles, setKbArticles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [expiredDocs, setExpiredDocs] = useState([]);

  // Phase 26: Workflow Engine
  const [workflowDefs, setWorkflowDefs] = useState([]);
  const [workflowExecs, setWorkflowExecs] = useState([]);
  const [wfName, setWfName] = useState('');
  const [wfDesc, setWfDesc] = useState('');
  const [wfTrigger, setWfTrigger] = useState('ONBOARDING_COMPLETE');
  const [wfSteps, setWfSteps] = useState('');

  // Phase 27: Communication & Notifications
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState('ALL');
  const [annExpiry, setAnnExpiry] = useState('');

  // Phase 28: Reports & Analytics
  const [reportDefs, setReportDefs] = useState([]);
  const [dashMetrics, setDashMetrics] = useState({});
  const [reportResults, setReportResults] = useState([]);
  const [reportName, setReportName] = useState('');
  const [reportQuery, setReportQuery] = useState('');
  const [reportFormat, setReportFormat] = useState('CSV');
  const [reportModule, setReportModule] = useState('GENERAL');
  const [activeReportId, setActiveReportId] = useState(null);

  // Phase 29: Integrations & Webhooks
  const [integrations, setIntegrations] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [intProvider, setIntProvider] = useState('GOOGLE');
  const [intClientId, setIntClientId] = useState('');
  const [intClientSecret, setIntClientSecret] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whDesc, setWhDesc] = useState('');
  const [whSecret, setWhSecret] = useState('');
  const [whEvents, setWhEvents] = useState('"LEAVE_APPROVED"');

  // Phase 30: Mobile Platform
  const [mobileDevices, setMobileDevices] = useState([]);
  const [mobileToken, setMobileToken] = useState('');
  const [mobilePlatform, setMobilePlatform] = useState('ANDROID');
  const [mobileVersion, setMobileVersion] = useState('');
  const [syncDelta, setSyncDelta] = useState(null);

  // Phase 31: AI & Automation
  const [anomalies, setAnomalies] = useState([]);
  const [candFitId, setCandFitId] = useState('');
  const [candFitResult, setCandFitResult] = useState(null);
  const [empAttrId, setEmpAttrId] = useState('');
  const [empAttrResult, setEmpAttrResult] = useState(null);

  // Phase 32: Compliance & Governance
  const [gdprConsent, setGdprConsent] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Phase 33: Platform Settings
  const [companyName, setCompanyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');
  const [dateFormat, setDateFormat] = useState('');

  // Phase 34: Enterprise Features
  const [apiKeyName, setApiKeyName] = useState('');
  const [generatedApiKey, setGeneratedApiKey] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [backups, setBackups] = useState([]);

  // Forms & Inputs
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  
  const [travelDest, setTravelDest] = useState('');
  const [travelPurpose, setTravelPurpose] = useState('');
  const [travelStart, setTravelStart] = useState('');
  const [travelEnd, setTravelEnd] = useState('');

  const [selectedProject, setSelectedProject] = useState('');
  const [timesheetHours, setTimesheetHours] = useState('');
  const [timesheetDate, setTimesheetDate] = useState('');

  const [allocateProjId, setAllocateProjId] = useState('');
  const [allocateEmpId, setAllocateEmpId] = useState('');
  const [allocateRole, setAllocateRole] = useState('');

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');

  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [kbCategory, setKbCategory] = useState('');

  const [docFile, setDocFile] = useState(null);
  const [docExpiry, setDocExpiry] = useState('');
  const [signingDocId, setSigningDocId] = useState(null);
  const [signatureText, setSignatureText] = useState('');

  const [resignationReason, setResignationReason] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    suiteService.getPayslips().then(res => setPayslips(res)).catch(e => console.error(e));
    suiteService.getGoals().then(res => setGoals(res)).catch(e => console.error(e));
    suiteService.getCourses().then(res => setCourses(res)).catch(e => console.error(e));
    suiteService.getExpenses().then(res => setExpenses(res)).catch(e => console.error(e));
    suiteService.getTravelRequests().then(res => setTravel(res)).catch(e => console.error(e));
    suiteService.getProjects().then(res => {
      setProjects(res);
      if (res.length > 0) {
        setSelectedProject(res[0].id);
        setAllocateProjId(res[0].id);
      }
    }).catch(e => console.error(e));
    suiteService.getTimesheets().then(res => setTimesheets(res)).catch(e => console.error(e));
    suiteService.getTickets().then(res => setTickets(res)).catch(e => console.error(e));
    suiteService.getDocuments().then(res => setDocuments(res)).catch(e => console.error(e));
    suiteService.getExpiredDocuments().then(res => setExpiredDocs(res)).catch(e => console.error(e));
    suiteService.getWorkflowDefinitions().then(res => setWorkflowDefs(res)).catch(e => console.error(e));
    suiteService.getWorkflowExecutions().then(res => setWorkflowExecs(res)).catch(e => console.error(e));
    suiteService.getAnnouncements().then(res => setAnnouncements(res)).catch(e => console.error(e));
    suiteService.getNotifications().then(res => setNotifications(res)).catch(e => console.error(e));
    suiteService.getUnreadNotificationCount().then(res => setUnreadCount(res.count ?? 0)).catch(e => console.error(e));
    suiteService.getReportDefinitions().then(res => setReportDefs(res)).catch(e => console.error(e));
    suiteService.getDashboardMetrics().then(res => setDashMetrics(res)).catch(e => console.error(e));
    suiteService.getIntegrations().then(res => setIntegrations(res)).catch(e => console.error(e));
    suiteService.getWebhooks().then(res => setWebhooks(res)).catch(e => console.error(e));
    suiteService.getMobileDevices().then(res => setMobileDevices(res)).catch(e => console.error(e));
    suiteService.getAnomalies().then(res => setAnomalies(res)).catch(e => console.error(e));
    suiteService.getGdprConsent().then(res => setGdprConsent(res.consentGiven ?? false)).catch(e => console.error(e));
    suiteService.getAuditLogs().then(res => setAuditLogs(res)).catch(e => console.error(e));
    suiteService.getPlatformSettings().then(res => {
      setCompanyName(res.companyName || '');
      setPrimaryColor(res.primaryColor || '');
      setLogoUrl(res.logoUrl || '');
      setSupportEmail(res.supportEmail || '');
      setCurrency(res.currency || 'USD');
      setTimezone(res.timezone || 'UTC');
      setDateFormat(res.dateFormat || 'yyyy-MM-dd');
    }).catch(e => console.error(e));
    suiteService.getApiKeys().then(res => setApiKeys(res)).catch(e => console.error(e));
    suiteService.getBackups().then(res => setBackups(res)).catch(e => console.error(e));
  };

  useEffect(() => {
    loadData();
  }, []);


  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  // Actions
  const handleUpdateGoal = (goalId, currentVal) => {
    startTransition(async () => {
      try {
        await suiteService.updateGoalProgress(goalId, { progress: currentVal + 10 });
        loadData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  // Phase 21: Expense Claims Submit & Physical Receipt Upload
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseAmount || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.submitExpense({
          amount: expenseAmount,
          description: expenseDesc
        });
        setMessage('Expense claim filed. Please attach your receipt below under "Expense Reimbursements".');
        setExpenseAmount('');
        setExpenseDesc('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Submission failed.');
      }
    });
  };

  const handleReceiptUpload = (claimId, file) => {
    if (!file) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.uploadReceipt(claimId, file);
        setMessage('Receipt file uploaded and attached to claim successfully.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Receipt upload failed.');
      }
    });
  };

  const handleApproveExpense = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.approveExpense(id);
        setMessage('Expense approved.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  const handleRejectExpense = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.rejectExpense(id);
        setMessage('Expense rejected.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  // Phase 22: Travel Requests Create & Approvals
  const handleTravelSubmit = (e) => {
    e.preventDefault();
    if (!travelDest || !travelStart || !travelEnd || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.submitTravelRequest({
          destination: travelDest,
          purpose: travelPurpose,
          startDate: travelStart,
          endDate: travelEnd
        });
        setMessage('Travel booking request recorded.');
        setTravelDest('');
        setTravelPurpose('');
        setTravelStart('');
        setTravelEnd('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit.');
      }
    });
  };

  const handleApproveTravel = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.approveTravelRequest(id);
        setMessage('Travel request approved.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  const handleRejectTravel = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.rejectTravelRequest(id);
        setMessage('Travel request rejected.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  // Phase 23: Timesheets & Project Allocations
  const handleTimesheetSubmit = (e) => {
    e.preventDefault();
    if (!timesheetHours || !timesheetDate || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.submitTimesheet({
          projectId: selectedProject,
          hours: timesheetHours,
          date: timesheetDate
        });
        setMessage('Timesheet hours logged.');
        setTimesheetHours('');
        setTimesheetDate('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Overlap checking or daily limit failed.');
      }
    });
  };

  const handleAllocateResource = (e) => {
    e.preventDefault();
    if (!allocateEmpId || !allocateRole || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.allocateResource({
          projectId: allocateProjId,
          employeeId: allocateEmpId,
          role: allocateRole
        });
        setMessage('Resource allocated to project successfully.');
        setAllocateEmpId('');
        setAllocateRole('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Allocation failed.');
      }
    });
  };

  const handleApproveTimesheet = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.approveTimesheet(id);
        setMessage('Timesheet entry approved.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  const handleRejectTimesheet = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.rejectTimesheet(id);
        setMessage('Timesheet entry rejected.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  // Phase 24: Support Tickets & KB Search
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.submitTicket({
          subject: ticketSubject,
          description: ticketDesc,
          priority: ticketPriority
        });
        setMessage('Support ticket generated & auto-assigned.');
        setTicketSubject('');
        setTicketDesc('');
        setTicketPriority('MEDIUM');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Ticket creation failed.');
      }
    });
  };

  const handleAssignTicket = (id, assigneeId) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.assignTicket(id, assigneeId);
        setMessage('Support ticket assigned.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  const handleResolveTicket = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.resolveTicket(id);
        setMessage('Support ticket resolved.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed.');
      }
    });
  };

  const handleKbSearch = (e) => {
    e.preventDefault();
    suiteService.searchKnowledgeBase(kbQuery)
      .then(res => setKbArticles(res))
      .catch(err => console.error(err));
  };

  const handleCreateKbArticle = (e) => {
    e.preventDefault();
    if (!kbTitle || !kbContent || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.createKnowledgeBaseArticle({
          title: kbTitle,
          content: kbContent,
          category: kbCategory || 'IT Support'
        });
        setMessage('Knowledge Base article created.');
        setKbTitle('');
        setKbContent('');
        setKbCategory('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Creation failed.');
      }
    });
  };

  // Phase 25: Compliance Documents Real Physical Upload & SignaturePad
  const handleDocSubmit = (e) => {
    e.preventDefault();
    if (!docFile || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.uploadDocument(docFile, docExpiry || null);
        setMessage('Compliance document file physically uploaded & registered successfully.');
        setDocFile(null);
        setDocExpiry('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Document upload failed.');
      }
    });
  };

  const handleSignDocumentSubmit = (e) => {
    e.preventDefault();
    if (!signatureText || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.signDocument(signingDocId, signatureText);
        setMessage('Digital signature securely logged and verified.');
        setSigningDocId(null);
        setSignatureText('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Signature logging failed.');
      }
    });
  };

  const handleResignSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await suiteService.submitResignation({ reason: resignationReason });
        setResignationReason('');
        loadData();
        setMessage('Resignation submitted successfully.');
      } catch (e) {
        console.error(e);
      }
    });
  };

  // ── Phase 26: Workflow Engine Handlers ──────────────────────────────────────
  const handleCreateWorkflow = (e) => {
    e.preventDefault();
    if (!wfName || !wfSteps || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        const steps = JSON.stringify(wfSteps.split(',').map((s, i) => ({ step: i + 1, name: s.trim() })));
        await suiteService.createWorkflowDefinition({ name: wfName, description: wfDesc, triggerEvent: wfTrigger, stepsJson: steps });
        setMessage('Workflow definition created successfully.');
        setWfName(''); setWfDesc(''); setWfSteps('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Creation failed.');
      }
    });
  };

  const handleTriggerWorkflow = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.triggerWorkflow(id);
        setMessage('Workflow triggered. Execution started.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Trigger failed.');
      }
    });
  };

  const handleAdvanceExecution = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.advanceWorkflowExecution(id);
        setMessage('Workflow step advanced.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Advance failed.');
      }
    });
  };

  const handleCancelExecution = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.cancelWorkflowExecution(id);
        setMessage('Workflow execution cancelled.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Cancel failed.');
      }
    });
  };

  // ── Phase 27: Communication Handlers ────────────────────────────────────────
  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle || !annContent || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.postAnnouncement({ title: annTitle, content: annContent, targetAudience: annAudience, expiresAt: annExpiry || null });
        setMessage('Announcement posted to all employees.');
        setAnnTitle(''); setAnnContent(''); setAnnExpiry('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Post failed.');
      }
    });
  };

  const handleMarkRead = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.markNotificationRead(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDeleteAnnouncement = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.deleteAnnouncement(id);
        setMessage('Announcement deleted.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
      }
    });
  };

  // ── Phase 28: Reports Handlers ───────────────────────────────────────────────
  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!reportName || !reportQuery || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.createReportDefinition({ name: reportName, queryTemplate: reportQuery, format: reportFormat, module: reportModule });
        setMessage('Report definition saved.');
        setReportName(''); setReportQuery('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Save failed.');
      }
    });
  };

  const handleRunReport = (id) => {
    clearMessages();
    setActiveReportId(id);
    startTransition(async () => {
      try {
        const res = await suiteService.runReport(id, {});
        setReportResults(res.data || []);
        setMessage(`Report executed — ${res.count} rows returned.`);
      } catch (err) {
        setError(err.response?.data?.message || 'Execution failed.');
      }
    });
  };

  const handleExportCsv = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        const res = await suiteService.exportReportCsv(id, {});
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setMessage('CSV export downloaded.');
      } catch (err) {
        setError('Export failed.');
      }
    });
  };

  // ── Phase 29: Integrations Handlers ─────────────────────────────────────────
  const handleUpsertIntegration = (e) => {
    e.preventDefault();
    if (!intClientId || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.upsertIntegration({ provider: intProvider, clientId: intClientId, clientSecret: intClientSecret });
        setMessage(`${intProvider} integration saved.`);
        setIntClientId(''); setIntClientSecret('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Save failed.');
      }
    });
  };

  const handleToggleIntegration = (id, active) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.toggleIntegration(id, !active);
        setMessage(`Integration ${!active ? 'enabled' : 'disabled'}.`);
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Toggle failed.');
      }
    });
  };

  const handleAddWebhook = (e) => {
    e.preventDefault();
    if (!whUrl || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.addWebhook({ targetUrl: whUrl, description: whDesc, secret: whSecret, eventsJson: `[${whEvents}]` });
        setMessage('Webhook endpoint registered.');
        setWhUrl(''); setWhDesc(''); setWhSecret(''); setWhEvents('"LEAVE_APPROVED"');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    });
  };

  const handleDeleteWebhook = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.deleteWebhook(id);
        setMessage('Webhook deleted.');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
      }
    });
  };

  // ── Phase 30: Mobile Sync Handlers ───────────────────────────────────────────
  const handleRegisterDevice = (e) => {
    e.preventDefault();
    if (!mobileToken || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.registerMobileDevice({ deviceToken: mobileToken, platform: mobilePlatform, clientVersion: mobileVersion });
        setMessage('Mobile device registered successfully.');
        setMobileToken(''); setMobileVersion('');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    });
  };

  const handleSyncDevice = (token) => {
    clearMessages();
    startTransition(async () => {
      try {
        const res = await suiteService.getMobileSyncDelta(token);
        setSyncDelta(res.data);
        setMessage('Sync delta fetched successfully.');
      } catch (err) {
        setError('Sync failed.');
      }
    });
  };

  const handleDeregisterDevice = (token) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.deregisterMobileDevice(token);
        setMessage('Device deregistered.');
        setSyncDelta(null);
        loadData();
      } catch (err) {
        setError('Deregistration failed.');
      }
    });
  };

  // ── Phase 31: AI & Automation Handlers ──────────────────────────────────────
  const handleDetectAnomalies = () => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.detectAnomalies();
        setMessage('AI Anomaly detection run finished.');
        loadData();
      } catch (err) {
        setError('Failed to trigger anomaly detection.');
      }
    });
  };

  const handleCandidateFit = (e) => {
    e.preventDefault();
    if (!candFitId || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        const res = await suiteService.getCandidateFit(candFitId);
        setCandFitResult(res.data);
        setMessage('Candidate suitability calculation complete.');
      } catch (err) {
        setError('Candidate fit retrieval failed. Verify UUID.');
      }
    });
  };

  const handleAttritionRisk = (e) => {
    e.preventDefault();
    if (!empAttrId || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        const res = await suiteService.getAttritionRisk(empAttrId);
        setEmpAttrResult(res.data);
        setMessage('Employee attrition flight-risk prediction complete.');
      } catch (err) {
        setError('Employee attrition calculation failed. Verify UUID.');
      }
    });
  };

  // ── Phase 32: Compliance & Governance Handlers ──────────────────────────────
  const handleSaveConsent = (checked) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.saveGdprConsent({ consentGiven: checked });
        setGdprConsent(checked);
        setMessage('GDPR sharing preferences updated.');
        loadData();
      } catch (err) {
        setError('Failed to update consent settings.');
      }
    });
  };

  const handlePurgeData = () => {
    clearMessages();
    startTransition(async () => {
      try {
        const res = await suiteService.runCompliancePurge();
        setMessage(res.message || 'Compliance purging routine finished successfully.');
        loadData();
      } catch (err) {
        setError('Failed to run compliance purging routine.');
      }
    });
  };

  // ── Phase 33: Platform Settings Handlers ────────────────────────────────────
  const handleUpdateSettings = (e) => {
    e.preventDefault();
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.updatePlatformSettings({
          companyName,
          primaryColor,
          logoUrl,
          supportEmail,
          currency,
          timezone,
          dateFormat
        });
        setMessage('Platform branding & localization settings updated.');
        loadData();
      } catch (err) {
        setError('Failed to update settings.');
      }
    });
  };

  // ── Phase 34: Enterprise Features Handlers ─────────────────────────────────
  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!apiKeyName || isPending) return;
    clearMessages();
    startTransition(async () => {
      try {
        const res = await suiteService.generateApiKey({ name: apiKeyName });
        setGeneratedApiKey(res.apiKey);
        setApiKeyName('');
        setMessage('API Credentials generated. COPY IT NOW - it will not be displayed again!');
        loadData();
      } catch (err) {
        setError('Failed to generate credentials.');
      }
    });
  };

  const handleRevokeKey = (id) => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.revokeApiKey(id);
        setMessage('API key revoked.');
        loadData();
      } catch (err) {
        setError('Failed to revoke API key.');
      }
    });
  };

  const handleTriggerBackup = () => {
    clearMessages();
    startTransition(async () => {
      try {
        await suiteService.triggerBackup();
        setMessage('Tenant database backup complete.');
        loadData();
      } catch (err) {
        setError('Backup generation failed.');
      }
    });
  };

  return (
    <div style={{ padding: '16px' }} suppressHydrationWarning={true}>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Enterprise HR Suite
        </h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)' }}>
          Production Unified Enterprise SaaS Management Portal
        </p>
      </header>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); clearMessages(); }}
            className={`nav-link ${activeTab === tab.id ? 'nav-link-active' : ''}`}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '12px 20px',
              color: activeTab === tab.id ? '#818cf8' : '#a1a1aa',
              fontWeight: '600',
              borderBottom: activeTab === tab.id ? '2px solid #818cf8' : '2px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {error && <div className={styles.alert} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{message}</div>}

      <div className="tab-content">
        
        {/* PAYROLL PORTAL */}
        {activeTab === 'payroll' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>My Payslips</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {payslips.length === 0 ? <p style={{ color: '#a1a1aa' }}>No payslips logged.</p> : payslips.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>Period: {p.payPeriod}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '6px' }}>
                        Net Salary Received: <strong style={{ color: '#818cf8' }}>${p.netSalary}</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '9999px', background: 'rgba(16,185,129,0.1)', color: '#10b981', alignSelf: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PERFORMANCE */}
        {activeTab === 'performance' && (
          <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>My OKRs & Objectives</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {goals.length === 0 ? <p style={{ color: '#a1a1aa' }}>No goals defined.</p> : goals.map(g => (
                <div key={g.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: '#fff' }}>{g.title}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: '700' }}>{g.currentValue}% Completed</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ width: `${g.currentValue}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '4px' }} />
                  </div>
                  {g.currentValue < 100 && (
                    <button 
                      onClick={() => handleUpdateGoal(g.id, g.currentValue)} 
                      style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#fff', transition: 'all 0.2s' }}
                      disabled={isPending}
                    >
                      + Log 10% Progress
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LMS CURRICULUM */}
        {activeTab === 'lms' && (
          <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>Curriculum & Courses</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {courses.map(c => (
                <div key={c.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(168,85,247,0.1)', color: '#c084fc', fontWeight: '700', border: '1px solid rgba(168,85,247,0.2)' }}>
                      {c.category}
                    </span>
                    <h4 style={{ margin: '14px 0 8px 0', color: '#fff', fontSize: '1.1rem' }}>{c.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '0 0 16px 0', lineHeight: '1.4' }}>{c.description}</p>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>✓ Completed ({c.status})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPENSES & TRAVEL TAB */}
        {activeTab === 'expenses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Forms section */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <form onSubmit={handleExpenseSubmit} className="form-card" style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>File Expense Claim</h3>
                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Reimbursement Amount ($)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={expenseAmount} 
                    onChange={(e) => setExpenseAmount(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Expense Description</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={expenseDesc} 
                    onChange={(e) => setExpenseDesc(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff' }} disabled={isPending}>
                  Submit Claim
                </button>
              </form>

              <form onSubmit={handleTravelSubmit} className="form-card" style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Book Travel Request</h3>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Destination</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. London Office, UK"
                    value={travelDest} 
                    onChange={(e) => setTravelDest(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Purpose of Travel</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. Client integration workshop"
                    value={travelPurpose} 
                    onChange={(e) => setTravelPurpose(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label} style={{ color: '#a1a1aa' }}>Start Date</label>
                    <input 
                      type="date" 
                      className={styles.input} 
                      value={travelStart} 
                      onChange={(e) => setTravelStart(e.target.value)} 
                      disabled={isPending}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label} style={{ color: '#a1a1aa' }}>End Date</label>
                    <input 
                      type="date" 
                      className={styles.input} 
                      value={travelEnd} 
                      onChange={(e) => setTravelEnd(e.target.value)} 
                      disabled={isPending}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff' }} disabled={isPending}>
                  Request Travel
                </button>
              </form>
            </div>

            {/* List section */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              
              <div className="form-card" style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Expense Reimbursements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {expenses.length === 0 ? <p style={{ color: '#a1a1aa' }}>No claims recorded.</p> : expenses.map(exp => {
                    const isOverLimit = Number(exp.amount) > 500;
                    return (
                      <div key={exp.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>${exp.amount}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '4px' }}>{exp.description}</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: exp.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : exp.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: exp.status === 'APPROVED' ? '#10b981' : exp.status === 'REJECTED' ? '#ef4444' : '#f59e0b' }}>
                            {exp.status}
                          </span>
                        </div>
                        {exp.receipt_url && (
                          <div style={{ fontSize: '0.75rem', color: '#818cf8', wordBreak: 'break-all' }}>
                            📁 Receipt: <code>{exp.receipt_url}</code>
                          </div>
                        )}
                        {exp.status === 'PENDING' && !exp.receipt_url && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '600' }}>📤 Attach Receipt (Physical upload):</label>
                            <input 
                              type="file" 
                              style={{ fontSize: '0.75rem', color: '#fff', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }} 
                              onChange={(e) => handleReceiptUpload(exp.id, e.target.files[0])} 
                            />
                          </div>
                        )}
                        {isOverLimit && exp.status === 'PENDING' && (
                          <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold', marginTop: '4px' }}>
                            ⚠️ Threshold rule: Exceeds $500. Required SUPER_ADMIN approval.
                          </span>
                        )}
                        {exp.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => handleApproveExpense(exp.id)} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '4px 10px', height: '30px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} disabled={isPending}>
                              Approve
                            </button>
                            <button onClick={() => handleRejectExpense(exp.id)} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 10px', height: '30px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} disabled={isPending}>
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-card" style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Travel Booking Itinerary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {travel.length === 0 ? <p style={{ color: '#a1a1aa' }}>No itineraries requested.</p> : travel.map(tr => (
                    <div key={tr.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{tr.destination}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '2px' }}>Purpose: {tr.purpose}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: tr.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : tr.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: tr.status === 'APPROVED' ? '#10b981' : tr.status === 'REJECTED' ? '#ef4444' : '#f59e0b' }}>
                          {tr.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        📅 Dates: {tr.startDate} to {tr.endDate}
                      </div>
                      {tr.approvedBy && (
                        <div style={{ fontSize: '0.7rem', color: '#818cf8' }}>
                          Approver ID: {tr.approvedBy}
                        </div>
                      )}
                      {tr.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button onClick={() => handleApproveTravel(tr.id)} style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} disabled={isPending}>
                            Approve
                          </button>
                          <button onClick={() => handleRejectTravel(tr.id)} style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} disabled={isPending}>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TIMESHEETS & SUPPORT TAB */}
        {activeTab === 'timesheets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Forms section */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <form onSubmit={handleTimesheetSubmit} className="form-card" style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Log Timesheet Hours</h3>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Active Project</label>
                  <select 
                    className={styles.input}
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    disabled={isPending}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Date Logged</label>
                  <input 
                    type="date"
                    className={styles.input}
                    value={timesheetDate}
                    onChange={(e) => setTimesheetDate(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    disabled={isPending}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Hours Worked</label>
                  <input 
                    type="number" 
                    step="0.5"
                    className={styles.input} 
                    value={timesheetHours} 
                    onChange={(e) => setTimesheetHours(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff' }} disabled={isPending}>
                  Log Hours
                </button>
              </form>

              {/* Resource Allocation */}
              <form onSubmit={handleAllocateResource} className="form-card" style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Resource Project Allocation</h3>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Project</label>
                  <select 
                    className={styles.input}
                    value={allocateProjId}
                    onChange={(e) => setAllocateProjId(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    disabled={isPending}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Employee UUID</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. emp-101"
                    value={allocateEmpId} 
                    onChange={(e) => setAllocateEmpId(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Project Role</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. Lead Developer"
                    value={allocateRole} 
                    onChange={(e) => setAllocateRole(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff' }} disabled={isPending}>
                  Allocate Resource
                </button>
              </form>
            </div>

            {/* Timesheets List */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>Timesheet Approvals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {timesheets.length === 0 ? <p style={{ color: '#a1a1aa' }}>No timesheet hours logged.</p> : timesheets.map(t => (
                  <div key={t.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{t.project_name || 'Project Log'}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '4px' }}>
                        Date: {t.work_date} | Hours: <strong style={{ color: '#818cf8' }}>{t.hours_worked} hrs</strong>
                        {t.first_name && ` | Employee: ${t.first_name} ${t.last_name}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: t.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : t.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: t.status === 'APPROVED' ? '#10b981' : t.status === 'REJECTED' ? '#ef4444' : '#f59e0b' }}>
                        {t.status}
                      </span>
                      {t.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleApproveTimesheet(t.id)} style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isPending}>
                            Approve
                          </button>
                          <button onClick={() => handleRejectTimesheet(t.id)} style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isPending}>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IT Help Desk support tickets and KB */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              
              <div className="form-card" style={{ flex: 1.5, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Help Desk Tickets Pipeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tickets.length === 0 ? <p style={{ color: '#a1a1aa' }}>No active tickets.</p> : tickets.map(tk => (
                    <div key={tk.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>[{tk.priority}] {tk.subject}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '4px' }}>{tk.description}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: tk.status === 'RESOLVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: tk.status === 'RESOLVED' ? '#10b981' : '#ef4444' }}>
                          {tk.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        Author: {tk.author_first ? `${tk.author_first} ${tk.author_last}` : 'Self'} | 
                        Assignee: <strong style={{ color: '#818cf8' }}>{tk.assignee_first ? `${tk.assignee_first} ${tk.assignee_last}` : 'AUTO-ASSIGN PENDING'}</strong>
                      </div>
                      {tk.status === 'OPEN' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button onClick={() => handleResolveTicket(tk.id)} style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} disabled={isPending}>
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '300px' }}>
                
                <form onSubmit={handleTicketSubmit} className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
                  <h3 style={{ color: '#fff', marginBottom: '16px' }}>Submit Support Ticket</h3>
                  <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                    <label className={styles.label} style={{ color: '#a1a1aa' }}>Subject</label>
                    <input 
                      type="text" 
                      className={styles.input}
                      value={ticketSubject} 
                      onChange={(e) => setTicketSubject(e.target.value)} 
                      disabled={isPending}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                    <label className={styles.label} style={{ color: '#a1a1aa' }}>Priority</label>
                    <select 
                      className={styles.input}
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      disabled={isPending}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                    <label className={styles.label} style={{ color: '#a1a1aa' }}>Description</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={ticketDesc} 
                      onChange={(e) => setTicketDesc(e.target.value)} 
                      disabled={isPending}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff' }} disabled={isPending}>
                    Open Ticket
                  </button>
                </form>

                {/* Knowledge Base */}
                <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ color: '#fff', marginBottom: '12px' }}>Knowledge Base Articles</h3>
                  <form onSubmit={handleKbSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      className={styles.input}
                      placeholder="Search category, topic..."
                      value={kbQuery}
                      onChange={(e) => setKbQuery(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }}
                    />
                    <button type="submit" style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0 16px' }}>
                      Search
                    </button>
                  </form>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {kbArticles.map(art => (
                      <div key={art.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 'bold' }}>{art.category}</span>
                        <h5 style={{ color: '#fff', margin: '4px 0', fontSize: '0.9rem' }}>{art.title}</h5>
                        <p style={{ color: '#a1a1aa', fontSize: '0.75rem', margin: '0' }}>{art.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* DOCUMENT CENTER TAB */}
        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <form onSubmit={handleDocSubmit} className="form-card" style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Upload Compliance Document</h3>
                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Document File (Physical Upload)</label>
                  <input 
                    type="file" 
                    className={styles.input} 
                    onChange={(e) => setDocFile(e.target.files[0])}
                    disabled={isPending}
                    required
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                  <label className={styles.label} style={{ color: '#a1a1aa' }}>Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    className={styles.input} 
                    value={docExpiry} 
                    onChange={(e) => setDocExpiry(e.target.value)} 
                    disabled={isPending}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff' }} disabled={isPending}>
                  Upload File to Isolated storage
                </button>
              </form>

              <div className="form-card" style={{ flex: 1.5, minWidth: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>My Active Documents</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {documents.length === 0 ? <p style={{ color: '#a1a1aa' }}>No active documents.</p> : documents.map(doc => (
                    <div key={doc.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{doc.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '2px', wordBreak: 'break-all' }}>
                            File storage path: <code>{doc.document_url}</code>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: doc.signed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: doc.signed ? '#10b981' : '#ef4444' }}>
                          {doc.signed ? 'SIGNED' : 'PENDING SIGNATURE'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        📅 Expiry Date: {doc.expiry_date || 'No Expiry'}
                      </div>
                      {doc.signed && doc.signature_data && (
                        <div style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                          ✍️ Verified Digital Signee: <i>{doc.signature_data}</i>
                        </div>
                      )}
                      {!doc.signed && (
                        <button 
                          onClick={() => setSigningDocId(doc.id)} 
                          style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '4px' }}
                        >
                          🖊️ Access Signature Pad
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expired document list checker */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>Compliance Expiry Checker</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expiredDocs.length === 0 ? <p style={{ color: '#10b981', fontWeight: '600' }}>✓ All active documents are fully compliant with zero expired items.</p> : expiredDocs.map(ex => (
                  <div key={ex.id} style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#ef4444' }}>🔴 EXPIRED: {ex.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '2px' }}>Isolated S3 URL: {ex.document_url}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>
                      Expired Date: {ex.expiry_date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Signature Pad Dialog overlay overlay */}
            {signingDocId && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <form onSubmit={handleSignDocumentSubmit} className="form-card" style={{ width: '400px', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }} noValidate>
                  <h3 style={{ color: '#fff', marginBottom: '12px' }}>Verify Digital Signature</h3>
                  <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '16px', lineHeight: '1.4' }}>
                    By typing your full name below, you verify and bind your legal consent to the document under compliance standards.
                  </p>
                  <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                    <label className={styles.label} style={{ color: '#a1a1aa' }}>Legal Signature Name</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Type your full legal name"
                      value={signatureText} 
                      onChange={(e) => setSignatureText(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex: 1, background: '#10b981', border: 'none', color: '#fff' }} disabled={isPending}>
                      Sign Document
                    </button>
                    <button type="button" onClick={() => { setSigningDocId(null); setSignatureText(''); }} className={`${styles.btn}`} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}


        {/* OFFBOARDING */}
        {activeTab === 'offboarding' && (
          <form onSubmit={handleResignSubmit} className="form-card" style={{ maxWidth: '600px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
            <h3 style={{ color: '#fff', marginBottom: '12px' }}>Submit Resignation Request</h3>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '20px' }}>
              If you wish to terminate your workspace contract, submit a formal resignation claim. A standard 30-day notice period applies.
            </p>
            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <label className={styles.label} style={{ color: '#a1a1aa' }}>Reason for Departure</label>
              <input
                type="text"
                className={styles.input}
                value={resignationReason}
                onChange={(e) => setResignationReason(e.target.value)}
                disabled={isPending}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>
            <button type="submit" className={styles.btn} style={{ background: '#ef4444', border: 'none', color: '#fff' }} disabled={isPending}>
              Submit Resignation
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 26: WORKFLOW ENGINE                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'workflows' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Create Workflow Definition */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#818cf8', marginBottom: '4px' }}>⚙️ Create Workflow Definition</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Define automated workflow steps that trigger on HR events.</p>
              <form onSubmit={handleCreateWorkflow} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
                <input id="wf-name" className={styles.input} placeholder="Workflow Name *" value={wfName} onChange={e => setWfName(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <input id="wf-desc" className={styles.input} placeholder="Description (optional)" value={wfDesc} onChange={e => setWfDesc(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <select id="wf-trigger" className={styles.input} value={wfTrigger} onChange={e => setWfTrigger(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="ONBOARDING_COMPLETE">Onboarding Complete</option>
                  <option value="LEAVE_APPROVED">Leave Approved</option>
                  <option value="OFFBOARDING_START">Offboarding Start</option>
                  <option value="EXPENSE_SUBMITTED">Expense Submitted</option>
                  <option value="PERFORMANCE_REVIEW">Performance Review</option>
                </select>
                <input id="wf-steps" className={styles.input} placeholder="Steps (comma-separated): Review, Approve, Notify" value={wfSteps} onChange={e => setWfSteps(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff' }} disabled={isPending}>Create Workflow</button>
              </form>
            </div>

            {/* Workflow Definitions List */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>📋 Workflow Definitions</h3>
              {workflowDefs.length === 0 ? <p style={{ color: '#a1a1aa' }}>No workflow definitions yet.</p> : workflowDefs.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{w.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '2px' }}>Trigger: {w.trigger_event}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{w.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', background: w.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: w.active ? '#10b981' : '#ef4444', fontWeight: '600' }}>{w.active ? 'Active' : 'Inactive'}</span>
                    <button onClick={() => handleTriggerWorkflow(w.id)} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>▶ Trigger</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Executions Tracker */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>🔄 Active Executions</h3>
              {workflowExecs.length === 0 ? <p style={{ color: '#a1a1aa' }}>No active executions.</p> : workflowExecs.map(ex => (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{ex.workflow_name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '2px' }}>Step {ex.current_step_index + 1} • Started: {ex.created_at}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', background: ex.status === 'ESCALATED' ? 'rgba(239,68,68,0.15)' : ex.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(234,179,8,0.15)', color: ex.status === 'ESCALATED' ? '#ef4444' : ex.status === 'COMPLETED' ? '#10b981' : '#eab308', fontWeight: '600' }}>{ex.status}</span>
                    </div>
                  </div>
                  {ex.status === 'IN_PROGRESS' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAdvanceExecution(ex.id)} style={{ padding: '6px 12px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>→ Advance</button>
                      <button onClick={() => handleCancelExecution(ex.id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>✕ Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 27: COMMUNICATION & NOTIFICATIONS                         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'communication' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Unread Count Banner */}
            {unreadCount > 0 && (
              <div style={{ padding: '14px 20px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🔔</span>
                <span style={{ color: '#818cf8', fontWeight: '600' }}>You have <strong>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}.</span>
              </div>
            )}

            {/* Post Announcement */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#a855f7', marginBottom: '4px' }}>📢 Post Announcement</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Broadcast company-wide or department-targeted announcements.</p>
              <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
                <input id="ann-title" className={styles.input} placeholder="Title *" value={annTitle} onChange={e => setAnnTitle(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <textarea id="ann-content" className={styles.input} placeholder="Announcement content *" value={annContent} onChange={e => setAnnContent(e.target.value)} rows={3} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select id="ann-audience" className={styles.input} value={annAudience} onChange={e => setAnnAudience(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }}>
                    <option value="ALL">All Employees</option>
                    <option value="DEPARTMENT">Department Only</option>
                    <option value="ROLE">Role Specific</option>
                  </select>
                  <input id="ann-expiry" type="date" className={styles.input} value={annExpiry} onChange={e => setAnnExpiry(e.target.value)} title="Expiry Date (optional)" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }} />
                </div>
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#a855f7,#c084fc)', border: 'none', color: '#fff' }} disabled={isPending}>📣 Post Announcement</button>
              </form>
            </div>

            {/* Announcements Feed */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>📰 Announcements Feed</h3>
              {announcements.length === 0 ? <p style={{ color: '#a1a1aa' }}>No announcements yet.</p> : announcements.map(a => (
                <div key={a.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${a.is_pinned ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      {a.is_pinned && <span style={{ fontSize: '0.72rem', color: '#eab308', fontWeight: '700', letterSpacing: '0.05em', marginRight: '8px' }}>📌 PINNED</span>}
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{a.title}</strong>
                      <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.5' }}>{a.content}</p>
                      <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '8px' }}>
                        By {a.author_first} {a.author_last} • {a.created_at} • Audience: {a.target_audience}
                        {a.expires_at && <span style={{ color: '#ef4444', marginLeft: '8px' }}>• Expires: {a.expires_at}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '12px' }} disabled={isPending}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Notifications Panel */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>🔔 My Notifications</h3>
              {notifications.length === 0 ? <p style={{ color: '#a1a1aa' }}>No notifications.</p> : notifications.map(n => (
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: n.is_read ? 'rgba(255,255,255,0.01)' : 'rgba(129,140,248,0.08)', border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.04)' : 'rgba(129,140,248,0.2)'}`, borderRadius: '10px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />}
                      <strong style={{ color: n.is_read ? '#a1a1aa' : '#fff', fontSize: '0.9rem' }}>{n.title}</strong>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>{n.category}</span>
                    </div>
                    <p style={{ color: '#71717a', fontSize: '0.82rem', marginTop: '4px' }}>{n.message}</p>
                    <div style={{ fontSize: '0.72rem', color: '#52525b', marginTop: '2px' }}>{n.created_at}</div>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '12px' }} disabled={isPending}>Mark Read</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 28: REPORTS & ANALYTICS                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* KPI Dashboard Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total Employees', value: dashMetrics.totalEmployees ?? '—', icon: '👥', color: '#818cf8' },
                { label: 'Open Leave Requests', value: dashMetrics.openLeaveRequests ?? '—', icon: '🏖️', color: '#a855f7' },
                { label: 'Open Support Tickets', value: dashMetrics.openSupportTickets ?? '—', icon: '🎫', color: '#f59e0b' },
                { label: 'Pending Expenses', value: dashMetrics.pendingExpenseClaims ?? '—', icon: '💸', color: '#10b981' },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>{m.icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: m.color, marginTop: '8px' }}>{m.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '4px' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Create Report Definition */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#10b981', marginBottom: '4px' }}>📝 Create Report Definition</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Define a reusable SELECT query template for reporting. Use <code style={{ color: '#818cf8' }}>:param_name</code> for parameter binding.</p>
              <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
                <input id="rep-name" className={styles.input} placeholder="Report Name *" value={reportName} onChange={e => setReportName(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <textarea id="rep-query" className={styles.input} placeholder="SELECT query template * e.g. SELECT id, first_name, last_name FROM employee WHERE deleted = FALSE" value={reportQuery} onChange={e => setReportQuery(e.target.value)} rows={3} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace', resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select id="rep-format" className={styles.input} value={reportFormat} onChange={e => setReportFormat(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }}>
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                  </select>
                  <select id="rep-module" className={styles.input} value={reportModule} onChange={e => setReportModule(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }}>
                    <option value="GENERAL">General</option>
                    <option value="PAYROLL">Payroll</option>
                    <option value="LEAVE">Leave</option>
                    <option value="ATTENDANCE">Attendance</option>
                    <option value="RECRUITMENT">Recruitment</option>
                  </select>
                </div>
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', border: 'none', color: '#fff' }} disabled={isPending}>Save Report</button>
              </form>
            </div>

            {/* Report Definitions List */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>📂 Saved Reports</h3>
              {reportDefs.length === 0 ? <p style={{ color: '#a1a1aa' }}>No reports defined yet.</p> : reportDefs.map(r => (
                <div key={r.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{r.name}</strong>
                      <span style={{ marginLeft: '10px', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{r.format}</span>
                      <span style={{ marginLeft: '6px', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>{r.module}</span>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>{r.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleRunReport(r.id)} style={{ padding: '6px 12px', background: 'rgba(129,140,248,0.2)', border: '1px solid rgba(129,140,248,0.3)', color: '#818cf8', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>▶ Run</button>
                      <button onClick={() => handleExportCsv(r.id)} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>⬇ CSV</button>
                    </div>
                  </div>
                  {/* Inline results */}
                  {activeReportId === r.id && reportResults.length > 0 && (
                    <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {Object.keys(reportResults[0]).map(col => (
                              <th key={col} style={{ padding: '8px 12px', textAlign: 'left', color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportResults.slice(0, 20).map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              {Object.values(row).map((val, j) => (
                                <td key={j} style={{ padding: '8px 12px', color: '#d1d5db', whiteSpace: 'nowrap' }}>{String(val ?? '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {reportResults.length > 20 && <p style={{ color: '#a1a1aa', fontSize: '0.75rem', marginTop: '8px' }}>Showing first 20 of {reportResults.length} rows. Export CSV for full data.</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 29: INTEGRATIONS & WEBHOOKS                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* OAuth Provider Config */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#eab308', marginBottom: '4px' }}>🔑 OAuth Provider Configuration</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Connect Google Workspace, Microsoft 365, or Slack for SSO and calendar sync.</p>
              <form onSubmit={handleUpsertIntegration} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
                <select id="int-provider" className={styles.input} value={intProvider} onChange={e => setIntProvider(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="GOOGLE">Google Workspace</option>
                  <option value="MICROSOFT">Microsoft 365</option>
                  <option value="SLACK">Slack</option>
                  <option value="OKTA">Okta</option>
                  <option value="JIRA">Jira</option>
                </select>
                <input id="int-client-id" className={styles.input} placeholder="Client ID *" value={intClientId} onChange={e => setIntClientId(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <input id="int-client-secret" className={styles.input} type="password" placeholder="Client Secret" value={intClientSecret} onChange={e => setIntClientSecret(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#eab308,#f59e0b)', border: 'none', color: '#000' }} disabled={isPending}>Save Integration</button>
              </form>
            </div>

            {/* Connected Integrations */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>🔗 Connected Integrations</h3>
              {integrations.length === 0 ? <p style={{ color: '#a1a1aa' }}>No integrations configured.</p> : integrations.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{i.provider}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '2px' }}>Last updated: {i.updated_at}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', background: i.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: i.active ? '#10b981' : '#ef4444', fontWeight: '600' }}>{i.active ? 'Enabled' : 'Disabled'}</span>
                    <button onClick={() => handleToggleIntegration(i.id, i.active)} style={{ padding: '6px 14px', background: i.active ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${i.active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: i.active ? '#ef4444' : '#10b981', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>{i.active ? 'Disable' : 'Enable'}</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Webhook Manager */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '4px' }}>🪝 Webhook Endpoints</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Register HTTPS endpoints to receive real-time HR event payloads, signed with HMAC-SHA256.</p>
              <form onSubmit={handleAddWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }} noValidate>
                <input id="wh-url" className={styles.input} placeholder="Target URL * (must be HTTPS)" value={whUrl} onChange={e => setWhUrl(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <input id="wh-desc" className={styles.input} placeholder="Description (optional)" value={whDesc} onChange={e => setWhDesc(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <input id="wh-secret" className={styles.input} type="password" placeholder="HMAC Secret (optional)" value={whSecret} onChange={e => setWhSecret(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <input id="wh-events" className={styles.input} placeholder='Events JSON e.g. "LEAVE_APPROVED","EXPENSE_SUBMITTED"' value={whEvents} onChange={e => setWhEvents(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace' }} />
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff' }} disabled={isPending}>Register Webhook</button>
              </form>
              {webhooks.length === 0 ? <p style={{ color: '#a1a1aa' }}>No webhooks registered.</p> : webhooks.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.85rem' }}>{w.target_url}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '2px' }}>{w.description} {w.last_triggered && `• Last triggered: ${w.last_triggered}`}</div>
                    <div style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: '2px', fontFamily: 'monospace' }}>{w.events_json}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '0.72rem', background: w.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: w.active ? '#10b981' : '#ef4444' }}>{w.active ? 'Active' : 'Inactive'}</span>
                    <button onClick={() => handleDeleteWebhook(w.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }} disabled={isPending}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 30: MOBILE PLATFORM SYNC                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'mobile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Register Device */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#60a5fa', marginBottom: '4px' }}>📱 Register Mobile Device</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Register a device token for push notifications and offline data synchronization.</p>
              <form onSubmit={handleRegisterDevice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
                <input id="mob-token" className={styles.input} placeholder="Device Token *" value={mobileToken} onChange={e => setMobileToken(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select id="mob-platform" className={styles.input} value={mobilePlatform} onChange={e => setMobilePlatform(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }}>
                    <option value="ANDROID">Android</option>
                    <option value="IOS">iOS</option>
                  </select>
                  <input id="mob-version" className={styles.input} placeholder="App Version (e.g. 2.1.0)" value={mobileVersion} onChange={e => setMobileVersion(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }} />
                </div>
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', border: 'none', color: '#fff' }} disabled={isPending}>Register Device</button>
              </form>
            </div>

            {/* Registered Devices */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>🗂️ Registered Devices</h3>
              {mobileDevices.length === 0 ? <p style={{ color: '#a1a1aa' }}>No registered devices.</p> : mobileDevices.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>{d.platform === 'IOS' ? '🍎' : '🤖'}</span>
                      <strong style={{ color: '#fff' }}>{d.platform}</strong>
                      {d.client_version && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>v{d.client_version}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>Last sync: {d.last_sync_at || 'Never'} • Registered: {d.created_at}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleSyncDevice(d.id)} style={{ padding: '6px 12px', background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>🔄 Sync</button>
                    <button onClick={() => handleDeregisterDevice(d.id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>Deregister</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync Delta Viewer */}
            {syncDelta && (
              <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#60a5fa' }}>📦 Sync Delta Payload</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: '600' }}>✓ Synced: {syncDelta.syncTimestamp}</span>
                    <button onClick={() => setSyncDelta(null)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>✕ Close</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px' }}>
                    <h4 style={{ color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Profile</h4>
                    {syncDelta.profile && Object.entries(syncDelta.profile).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#71717a', fontSize: '0.8rem' }}>{k}</span>
                        <span style={{ color: '#d1d5db', fontSize: '0.8rem', fontFamily: 'monospace' }}>{String(v ?? '—')}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px' }}>
                    <h4 style={{ color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unread Notifications ({syncDelta.unreadNotifications?.length ?? 0})</h4>
                    {syncDelta.unreadNotifications?.length === 0 ? <p style={{ color: '#52525b', fontSize: '0.8rem' }}>All caught up!</p> : syncDelta.unreadNotifications?.map(n => (
                      <div key={n.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: '600' }}>{n.title}</div>
                        <div style={{ color: '#71717a', fontSize: '0.75rem' }}>{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {syncDelta.pendingLeaves?.length > 0 && (
                  <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px' }}>
                    <h4 style={{ color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Leave Requests ({syncDelta.pendingLeaves.length})</h4>
                    {syncDelta.pendingLeaves.map(l => (
                      <div key={l.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#d1d5db', fontSize: '0.82rem' }}>{l.leave_type}</span>
                        <span style={{ color: '#eab308', fontSize: '0.78rem' }}>{l.start_date} → {l.end_date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 31: AI & AUTOMATION                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Anomaly Detection Hub */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ color: '#f59e0b', marginBottom: '4px' }}>⚠️ AI Anomaly Audit Feed</h3>
                  <p style={{ fontSize: '0.82rem', color: '#a1a1aa' }}>Scans punch-ins, expense sizes, and timesheet logs for non-compliance flags.</p>
                </div>
                <button onClick={handleDetectAnomalies} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', border: 'none', color: '#000', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} disabled={isPending}>🔍 Run Audit Check</button>
              </div>

              {anomalies.length === 0 ? <p style={{ color: '#a1a1aa' }}>No compliance anomalies flagged.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {anomalies.map(an => (
                    <div key={an.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', background: an.severity === 'HIGH' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: an.severity === 'HIGH' ? '#ef4444' : '#f59e0b', fontWeight: '600' }}>{an.severity}</span>
                          <strong style={{ color: '#fff' }}>{an.entityType} Log</strong>
                        </div>
                        <p style={{ color: '#d1d5db', fontSize: '0.82rem', marginTop: '6px' }}>{an.reason}</p>
                        <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>Entity UUID: {an.entityId} • Logged at: {an.detectedAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Candidate & Job Fit Checker */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '4px' }}>🎯 Candidate Job-Fit Calculator</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Matches parsed candidate skills against job requisition profiles.</p>
              <form onSubmit={handleCandidateFit} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }} noValidate>
                <input id="fit-cand-id" className={styles.input} placeholder="Candidate Application UUID *" value={candFitId} onChange={e => setCandFitId(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }} />
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff', padding: '12px 24px' }} disabled={isPending}>Calculate</button>
              </form>

              {candFitResult && (
                <div style={{ padding: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: '#fff', margin: 0 }}>Fit Result: {candFitResult.jobTitle}</h4>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', background: candFitResult.fitLevel === 'EXCELLENT' ? 'rgba(16,185,129,0.15)' : 'rgba(234,179,8,0.15)', color: candFitResult.fitLevel === 'EXCELLENT' ? '#10b981' : '#eab308', fontWeight: '700' }}>{candFitResult.fitLevel} FIT</span>
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#818cf8', textAlign: 'center', margin: '12px 0' }}>{candFitResult.matchScore}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '8px' }}>
                    <strong>Years of Experience:</strong> {candFitResult.experienceYears} yrs
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '6px' }}>
                    <strong>Matched Skills:</strong> {candFitResult.matchedSkills?.join(', ') || 'None'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '6px' }}>
                    <strong>Missing Skills:</strong> <span style={{ color: '#ef4444' }}>{candFitResult.missingSkills?.join(', ') || 'None'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Employee Attrition Predictor */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '4px' }}>📉 Attrition Risk Predictor</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Assess flight risk probability using peer feedback scores and employee tenure logs.</p>
              <form onSubmit={handleAttritionRisk} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }} noValidate>
                <input id="risk-emp-id" className={styles.input} placeholder="Employee UUID *" value={empAttrId} onChange={e => setEmpAttrId(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }} />
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#a855f7,#c084fc)', border: 'none', color: '#fff', padding: '12px 24px' }} disabled={isPending}>Predict Flight Risk</button>
              </form>

              {empAttrResult && (
                <div style={{ padding: '16px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: '#fff', margin: 0 }}>Target: {empAttrResult.fullName}</h4>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', background: empAttrResult.riskLevel === 'HIGH' ? 'rgba(239,68,68,0.15)' : (empAttrResult.riskLevel === 'MEDIUM' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'), color: empAttrResult.riskLevel === 'HIGH' ? '#ef4444' : (empAttrResult.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'), fontWeight: '700' }}>{empAttrResult.riskLevel} RISK</span>
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#c084fc', textAlign: 'center', margin: '12px 0' }}>{empAttrResult.attritionScore}%</div>
                  {empAttrResult.riskFactors?.length > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '12px' }}>
                      <strong>Key Risk Factors Identified:</strong>
                      <ul style={{ paddingLeft: '20px', marginTop: '6px', color: '#fca5a5' }}>
                        {empAttrResult.riskFactors.map((f, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 32: COMPLIANCE & GOVERNANCE                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* GDPR Consent configuration */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#10b981', marginBottom: '8px' }}>🛡️ GDPR Data Policy & Consent</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Manage consent permissions for company telemetry, payroll processing, and profiles directories.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <input id="gdpr-chk" type="checkbox" checked={gdprConsent} onChange={e => handleSaveConsent(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <div>
                  <label htmlFor="gdpr-chk" style={{ color: '#fff', fontWeight: '600', cursor: 'pointer' }}>I consent to processing my personal and financial details under corporate GDPR guidelines.</label>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>Consent status: {gdprConsent ? 'GRANTED' : 'REVOKED'}</div>
                </div>
              </div>
            </div>

            {/* Data Retention Purging */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '4px' }}>🗑️ Data Retention Purging</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Trigger automated cleaning loop to completely wipe soft-deleted records and expired files older than 30 days.</p>
              <button onClick={handlePurgeData} style={{ padding: '12px 24px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} disabled={isPending}>⚠️ Execute Retention Purge</button>
            </div>

            {/* Audit Logs Grid */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>📜 Audit & Governance Logs</h3>
              {auditLogs.length === 0 ? <p style={{ color: '#a1a1aa' }}>No system logs generated.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#818cf8' }}>
                        <th style={{ padding: '10px 12px' }}>Action</th>
                        <th style={{ padding: '10px 12px' }}>Table</th>
                        <th style={{ padding: '10px 12px' }}>Changed By</th>
                        <th style={{ padding: '10px 12px' }}>Old Value</th>
                        <th style={{ padding: '10px 12px' }}>New Value</th>
                        <th style={{ padding: '10px 12px' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#d1d5db' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '700' }}>{log.action}</td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{log.tableName}</td>
                          <td style={{ padding: '10px 12px' }}>{log.changedBy}</td>
                          <td style={{ padding: '10px 12px', color: '#71717a' }}>{log.oldValue}</td>
                          <td style={{ padding: '10px 12px', color: '#10b981' }}>{log.newValue}</td>
                          <td style={{ padding: '10px 12px', fontSize: '0.75rem' }}>{log.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 33: PLATFORM SETTINGS                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <form onSubmit={handleUpdateSettings} className="form-card" style={{ maxWidth: '650px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }} noValidate>
            <h3 style={{ color: '#fff', marginBottom: '4px' }}>⚙️ Company Configurations</h3>
            <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '20px' }}>Configure white-label branding, currencies, local timezones, and formats conventions.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company Branding Name</label>
                <input id="set-company" className={styles.input} value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Primary CSS Color Theme</label>
                <input id="set-color" className={styles.input} type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: '40px', padding: '2px', cursor: 'pointer' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Branding Logo URL</label>
                <input id="set-logo" className={styles.input} value={logoUrl || ''} onChange={e => setLogoUrl(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Corporate Support Email</label>
                <input id="set-email" className={styles.input} type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Base Currency</label>
                <select id="set-currency" className={styles.input} value={currency} onChange={e => setCurrency(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Local Timezone</label>
                <select id="set-timezone" className={styles.input} value={timezone} onChange={e => setTimezone(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">EST (New York)</option>
                  <option value="Europe/London">GMT (London)</option>
                  <option value="Asia/Karachi">PKT (Karachi)</option>
                  <option value="Asia/Singapore">SGT (Singapore)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date Format Pattern</label>
                <select id="set-date-format" className={styles.input} value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                </select>
              </div>
            </div>

            <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff' }} disabled={isPending}>Save Configurations</button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 34: ENTERPRISE CONSOLE                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'enterprise' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Developer credentials */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#818cf8', marginBottom: '4px' }}>🔑 Developer API Credentials</h3>
              <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '16px' }}>Generate secure hashed tokens to access the HR API gateway from external systems.</p>
              <form onSubmit={handleGenerateKey} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }} noValidate>
                <input id="api-key-name" className={styles.input} placeholder="API Key Alias (e.g. Production server) *" value={apiKeyName} onChange={e => setApiKeyName(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', flex: 1 }} />
                <button type="submit" className={styles.btn} style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff', padding: '12px 24px' }} disabled={isPending}>Generate Key</button>
              </form>

              {generatedApiKey && (
                <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px' }}>⚠️ COPY THIS KEY NOW - IT WILL NEVER BE SHOWN AGAIN:</div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', color: '#fff', fontSize: '0.9rem', wordBreak: 'break-all', userSelect: 'all' }}>{generatedApiKey}</div>
                </div>
              )}

              {apiKeys.length === 0 ? <p style={{ color: '#a1a1aa' }}>No active API credentials found.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {apiKeys.map(k => (
                    <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#fff' }}>{k.name}</strong>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#71717a' }}>({k.preview})</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>Created: {k.createdAt} • Expires: {k.expiresAt || 'Never'}</div>
                      </div>
                      <button onClick={() => handleRevokeKey(k.id)} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>Revoke</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tenant Database Backup Manager */}
            <div className="form-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ color: '#fff', marginBottom: '4px' }}>🗄️ Database Backups Utility</h3>
                  <p style={{ fontSize: '0.82rem', color: '#a1a1aa' }}>Create and retrieve tenant database backups snapshots safely.</p>
                </div>
                <button onClick={handleTriggerBackup} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} disabled={isPending}>📦 Create Snapshot</button>
              </div>

              {backups.length === 0 ? <p style={{ color: '#a1a1aa' }}>No backups records found.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {backups.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                      <div>
                        <strong style={{ color: '#fff' }}>{b.backupName}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '4px' }}>File Size: {b.fileSize} bytes • Status: <span style={{ color: '#10b981' }}>{b.status}</span></div>
                        <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '2px' }}>Generated: {b.createdAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
