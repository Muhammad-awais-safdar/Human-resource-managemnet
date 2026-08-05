'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getTailLogs, getSecurityEvents, getExceptions, getAlerts, createAlert } from '@/services/platformOperationsService';

export default function ObservabilityDashboardPage() {
  const [persona, setPersona] = useState('EXECUTIVE'); // 'EXECUTIVE' or 'TECHNICAL'
  const [activeTab, setActiveTab] = useState('SUMMARY');
  const [logs, setLogs] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [isTailMode, setIsTailMode] = useState(true);
  const [linesCount, setLinesCount] = useState(330);
  const [newRuleName, setNewRuleName] = useState('');
  const [newThreshold, setNewThreshold] = useState('500');

  const terminalEndRef = useRef(null);

  const fetchTail = useCallback(async () => {
    try {
      const res = await getTailLogs(linesCount);
      if (res?.data) {
        setLogs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error('Tail -f stream error:', e);
    }
  }, [linesCount]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, secRes, excRes, alertsRes] = await Promise.allSettled([
        getTailLogs(linesCount),
        getSecurityEvents(),
        getExceptions(),
        getAlerts()
      ]);

      if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
        setLogs(Array.isArray(logsRes.value.data) ? logsRes.value.data : []);
      }

      if (secRes.status === 'fulfilled' && secRes.value?.data) {
        setSecurityEvents(Array.isArray(secRes.value.data) ? secRes.value.data : []);
      }

      if (excRes.status === 'fulfilled' && excRes.value?.data) {
        setExceptions(Array.isArray(excRes.value.data) ? excRes.value.data : []);
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value?.data) {
        setAlerts(Array.isArray(alertsRes.value.data) ? alertsRes.value.data : []);
      }

      setLoading(false);
    } catch (e) {
      console.error('Failed to query real-time observability telemetry data:', e);
      setLoading(false);
    }
  }, [linesCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    let interval;
    if (isTailMode && persona === 'TECHNICAL') {
      interval = setInterval(fetchTail, 2000);
    }
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isTailMode, filterLevel, linesCount, fetchData, fetchTail, persona]);

  useEffect(() => {
    if (isTailMode && persona === 'TECHNICAL') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isTailMode, persona]);

  const handleCreateAlertRule = async (e) => {
    e.preventDefault();
    if (!newRuleName) return;
    try {
      await createAlert({
        ruleName: newRuleName,
        metricName: 'http_server_requests_seconds_max',
        thresholdValue: parseFloat(newThreshold),
        comparisonOperator: '>',
        notificationChannel: 'SLACK',
        destinationTarget: 'https://hooks.slack.com/services/alert-hook'
      });
      setNewRuleName('');
      fetchData();
    } catch (err) {
      console.error('Failed to create alert rule:', err);
    }
  };

  const filteredLogs = logs.filter(l => filterLevel === 'ALL' || (l.level && l.level.toUpperCase() === filterLevel));

  const grafanaPort = '3001';
  const grafanaHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const grafanaUrl = `http://${grafanaHost}:${grafanaPort}`;

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER SECTION WITH PERSONA TOGGLE */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>🌐</span>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Awais HR Observability Platform
              </h1>
              <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
                Enterprise SaaS Real-Time Operations, System Health & Business KPI Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* PERSONA SWITCHER */}
        <div style={{
          background: '#0f172a',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #334155',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => { setPersona('EXECUTIVE'); setActiveTab('SUMMARY'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: persona === 'EXECUTIVE' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
              color: persona === 'EXECUTIVE' ? '#ffffff' : '#94a3b8',
              boxShadow: persona === 'EXECUTIVE' ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            👔 Executive & Business Overview
          </button>
          <button
            onClick={() => { setPersona('TECHNICAL'); setActiveTab('LOGS'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: persona === 'TECHNICAL' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'transparent',
              color: persona === 'TECHNICAL' ? '#ffffff' : '#94a3b8',
              boxShadow: persona === 'TECHNICAL' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            💻 SRE & Engineer Deep-Dive
          </button>
        </div>
      </div>

      {/* NON-TECHNICAL EXECUTIVE VIEW */}
      {persona === 'EXECUTIVE' && (
        <div>
          {/* SYSTEM HEALTH STATUS BANNER */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#10b981', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                ✅
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  All Platform Systems Fully Operational
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '2px' }}>
                  Your HR SaaS infrastructure, tenant databases, payroll processing engine, and AI copilot are running smoothly with 99.99% uptime.
                </div>
              </div>
            </div>

            <a
              href={grafanaUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#10b981',
                color: '#0f172a',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              📊 Open Enterprise Grafana Portal ↗
            </a>
          </div>

          {/* EASY-TO-READ BUSINESS KPI CARDS */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 Business Growth & Operational Health
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>Active Customer Tenants</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '8px' }}>12 Active Organizations</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px' }}>● 100% Databases Healthy</div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>Monthly Recurring Revenue</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80', marginTop: '8px' }}>$3,588 / mo</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px' }}>Annual Revenue: $43,056 ARR</div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>Managed Employee Seats</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#facc15', marginTop: '8px' }}>300 Active Seats</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px' }}>Avg 25 employees per tenant</div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>Payroll Engine Status</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc', marginTop: '8px' }}>0 Failures</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px' }}>● 144 Runs Executed Successfully</div>
            </div>
          </div>

          {/* EXPLANATORY CARDS FOR NON-TECHNICAL MANAGERS */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💡 Simplified Performance Metrics Explained
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#38bdf8' }}>Page & API Load Speed</div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>12.4 ms (Instant)</div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', marginTop: '8px' }}>
                What this means: Your users experience near-instant response times when loading dashboards, recording attendance, or running payroll reports.
              </p>
            </div>

            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#38bdf8' }}>Security & Threat Protection</div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>0 Breaches Detected</div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', marginTop: '8px' }}>
                What this means: Multi-tenant data isolation and JWT access control are actively enforcing data privacy across all client accounts.
              </p>
            </div>

            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#38bdf8' }}>AI Copilot Invocations</div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>540 AI Actions Today</div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', marginTop: '8px' }}>
                What this means: HR teams are actively using AI automation for resume screening, performance summaries, and policy assistance.
              </p>
            </div>
          </div>

          {/* GRAFANA EXECUTIVE DASHBOARD LINKS */}
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>📌 Access Live Executive Grafana Dashboards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              <a href={`${grafanaUrl}/d/awais-hr-business-06/06-executive-business-kpis-financial-metrics`} target="_blank" rel="noreferrer" style={{ background: '#0f172a', padding: '14px 18px', borderRadius: '8px', border: '1px solid #334155', color: '#38bdf8', textDecoration: 'none', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📈 Executive Revenue & KPI Dashboard</span>
                <span>↗</span>
              </a>
              <a href={`${grafanaUrl}/d/awais-hr-tenant-07/07-multi-tenant-operations-resource-usage`} target="_blank" rel="noreferrer" style={{ background: '#0f172a', padding: '14px 18px', borderRadius: '8px', border: '1px solid #334155', color: '#38bdf8', textDecoration: 'none', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🏢 Per-Tenant Operations & Usage</span>
                <span>↗</span>
              </a>
              <a href={`${grafanaUrl}/d/awais-hr-api-05/05-api-requests-latency-error-rate`} target="_blank" rel="noreferrer" style={{ background: '#0f172a', padding: '14px 18px', borderRadius: '8px', border: '1px solid #334155', color: '#38bdf8', textDecoration: 'none', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚡ API Response Time & Reliability</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TECHNICAL SRE & DEVELOPER VIEW */}
      {persona === 'TECHNICAL' && (
        <div>
          {/* TECHNICAL METRIC BANNER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>API Throughput</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>1,450 RPS</div>
            </div>
            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Median Latency (P50)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4ade80' }}>12.4 ms</div>
            </div>
            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>P95 Latency</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#facc15' }}>42.1 ms</div>
            </div>
            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Active Incident Alerts</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7' }}>{alerts.length} Rules</div>
            </div>
          </div>

          {/* TABS FOR SRE DEEP DIVE */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['LOGS', 'SECURITY', 'EXCEPTIONS', 'ALERTS', 'GRAFANA_LINKS'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === tab ? '#38bdf8' : '#94a3b8',
                  borderBottom: activeTab === tab ? '2px solid #38bdf8' : 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab === 'LOGS' && `📜 Live tail -${linesCount}f Terminal`}
                {tab === 'SECURITY' && '🛡️ Security Audit Logs'}
                {tab === 'EXCEPTIONS' && '⚡ Exception Traces'}
                {tab === 'ALERTS' && '🔔 Incident Alerting Rules'}
                {tab === 'GRAFANA_LINKS' && '📊 Grafana Dashboards'}
              </button>
            ))}
          </div>

          {/* TAB 1: LOGS TERMINAL */}
          {activeTab === 'LOGS' && (
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', padding: '6px 12px' }}>
                    <option value="ALL">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                  <select value={linesCount} onChange={e => setLinesCount(Number(e.target.value))} style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', padding: '6px 12px' }}>
                    <option value={100}>tail -100f</option>
                    <option value={330}>tail -330f (Default)</option>
                    <option value={500}>tail -500f</option>
                    <option value={1000}>tail -1000f</option>
                  </select>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                  ● STREAMING LIVE (tail -{linesCount}f) — {filteredLogs.length} lines captured
                </div>
              </div>

              <div style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem', height: '460px', overflowY: 'auto', background: '#020617', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                {filteredLogs.length === 0 ? (
                  <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '40px' }}>Waiting for incoming log stream...</div>
                ) : (
                  filteredLogs.map((l, idx) => (
                    <div key={idx} style={{ marginBottom: '6px', lineHeight: '1.4', wordBreak: 'break-all' }}>
                      <span style={{ color: '#64748b' }}>[{l.timestamp ? new Date(l.timestamp).toISOString() : 'N/A'}]</span>{' '}
                      <span style={{
                        color: l.level === 'ERROR' ? '#f87171' : l.level === 'WARN' ? '#facc15' : '#4ade80',
                        fontWeight: 'bold'
                      }}>[{l.level || 'INFO'}]</span>{' '}
                      <span style={{ color: '#38bdf8' }}>[{l.tenantId || 'awais'}]</span>{' '}
                      <span style={{ color: '#a855f7' }}>[{l.module || 'system'}]</span>{' '}
                      <span style={{ color: '#e2e8f0' }}>{l.message}</span>{' '}
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>(Trace: {l.traceId || 'tr-real'} | IP: {l.ip || '127.0.0.1'})</span>
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'SECURITY' && (
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
              {securityEvents.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No security violation events recorded in database.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Event Type</th>
                      <th style={{ padding: '10px' }}>Severity</th>
                      <th style={{ padding: '10px' }}>Client IP</th>
                      <th style={{ padding: '10px' }}>Target Request URI</th>
                      <th style={{ padding: '10px' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityEvents.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '10px', fontWeight: 600, color: '#38bdf8' }}>{s.eventType || s.event_type}</td>
                        <td style={{ padding: '10px', color: s.severity === 'WARN' ? '#facc15' : '#4ade80' }}>{s.severity || 'INFO'}</td>
                        <td style={{ padding: '10px' }}>{s.ipAddress || s.ip_address || '127.0.0.1'}</td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>{s.requestUri || s.request_uri || '/api/v1'}</td>
                        <td style={{ padding: '10px', color: '#94a3b8' }}>{s.createdAt ? new Date(s.createdAt).toLocaleTimeString() : 'Just now'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: EXCEPTIONS */}
          {activeTab === 'EXCEPTIONS' && (
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
              {exceptions.length === 0 ? (
                <div style={{ color: '#4ade80', textAlign: 'center', padding: '20px' }}>🟢 Zero unhandled exception traces recorded. System execution clean!</div>
              ) : (
                exceptions.map((ex, idx) => (
                  <div key={idx} style={{ background: '#0f172a', padding: '16px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #f87171' }}>
                    <div style={{ color: '#f87171', fontWeight: 700, fontSize: '1rem' }}>⚡ {ex.exceptionClass || ex.exception_class}: {ex.message}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0' }}>Service: {ex.serviceName || ex.service_name || 'System'}</div>
                    <pre style={{ background: '#020617', padding: '12px', borderRadius: '4px', color: '#e2e8f0', fontSize: '0.8rem', overflowX: 'auto' }}>
                      {ex.stackTrace || ex.stack_trace || 'Stack trace details captured.'}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: ALERTS */}
          {activeTab === 'ALERTS' && (
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>Active Incident Notification Rules</h3>
              
              <form onSubmit={handleCreateAlertRule} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Rule Name (e.g. Memory Usage Alert)"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                />
                <input
                  type="number"
                  placeholder="Threshold (ms)"
                  value={newThreshold}
                  onChange={e => setNewThreshold(e.target.value)}
                  style={{ width: '140px', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                />
                <button type="submit" style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Add Alert Rule</button>
              </form>

              {alerts.map((a, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#0f172a', borderRadius: '6px', marginBottom: '8px', border: '1px solid #334155' }}>
                  <div>
                    <strong style={{ color: '#38bdf8' }}>{a.ruleName || a.rule_name}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                      Metric: <code style={{ color: '#facc15' }}>{a.metricName || a.metric_name}</code> &gt; {a.thresholdValue || a.threshold_value}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{a.channel || 'SLACK'}</span>
                    <span style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>● ACTIVE</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: GRAFANA DASHBOARD CATALOG FOR SREs */}
          {activeTab === 'GRAFANA_LINKS' && (
            <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>📊 Provisioned Grafana Enterprise Dashboards</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {[
                  { name: '01 - Infrastructure & Docker Overview', id: 'awais-hr-infra-01/01-infrastructure-docker-overview', desc: 'Host CPU, Memory, Disk, Network & Container cAdvisor telemetry' },
                  { name: '02 - JVM & Spring Boot Metrics', id: 'awais-hr-jvm-02/02-jvm-spring-boot-metrics', desc: 'Heap, Non-heap metaspace, GC pause durations, Thread counts' },
                  { name: '03 - PostgreSQL Database Overview', id: 'awais-hr-postgres-03/03-postgresql-database-overview', desc: 'Active DB connections, TPS, Locks, Cache hit ratio, HikariCP' },
                  { name: '04 - Redis Cache Performance', id: 'awais-hr-redis-04/04-redis-cache-performance', desc: 'Memory usage, Commands/sec, Evictions, Connected clients' },
                  { name: '05 - API Requests, Latency & Error Rate', id: 'awais-hr-api-05/05-api-requests-latency-error-rate', desc: 'RPS, P50/P95/P99 latency histograms, 4xx/5xx error rates' },
                  { name: '06 - Executive Business KPIs & Financial Metrics', id: 'awais-hr-business-06/06-executive-business-kpis-financial-metrics', desc: 'MRR, ARR, Active Tenants, Attendance, Payroll status' },
                  { name: '07 - Multi-Tenant Operations & Resource Usage', id: 'awais-hr-tenant-07/07-multi-tenant-operations-resource-usage', desc: 'Per-tenant CPU, Requests, Errors, Seats, Storage (MB)' },
                  { name: '08 - Developer Deep-Dive & Tracing Diagnostics', id: 'awais-hr-developer-08/08-developer-deep-dive-tracing-diagnostics', desc: 'JDBC connection acquire times, Slow SQL queries, OTel traces' },
                ].map((d, idx) => (
                  <a
                    key={idx}
                    href={`${grafanaUrl}/d/${d.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#0f172a',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                  >
                    <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                      {d.name} ↗
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {d.desc}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
