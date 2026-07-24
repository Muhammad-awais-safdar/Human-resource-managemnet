'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as analyticsService from '../../../../services/tenantAnalyticsService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function TenantAnalyticsPage() {
  const [overview, setOverview] = useState({ mrr: 0, arr: 0, activeTenants: 0, churnRatePercentage: 0 });
  const [metrics, setMetrics] = useState([]);

  const [subdomain, setSubdomain] = useState('');
  const [activeUsers, setActiveUsers] = useState(25);
  const [monthlyUsers, setMonthlyUsers] = useState(100);
  const [apiCalls, setApiCalls] = useState(5000);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    analyticsService.getSaaSOverview()
      .then(res => setOverview(res || {}))
      .catch(err => console.error(err));

    analyticsService.getTenantMetrics()
      .then(res => setMetrics(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordMetric = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!subdomain) return setError('Tenant subdomain is required.');

    startTransition(async () => {
      try {
        await analyticsService.recordMetric({ tenantSubdomain: subdomain, activeUsers: parseInt(activeUsers) || 0, monthlyUsers: parseInt(monthlyUsers) || 0, apiCallsCount: parseInt(apiCalls) || 0 });
        setMessage('Usage analytics metric snapshot recorded.');
        setSubdomain('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record metric.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Tenant Analytics & SaaS Metrics Dashboard</h1>
        <p className="page-subtitle">Monthly Recurring Revenue (MRR), active tenant engagement, feature adoption heatmaps, and churn risk scoring</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly Recurring Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-success)', marginTop: '4px' }}>${overview.mrr?.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Annual Recurring Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>${overview.arr?.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Platform Tenants</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{overview.activeTenants}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Churn Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-warning)', marginTop: '4px' }}>{overview.churnRatePercentage}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Tenant Engagement & Usage Roster</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metrics.map((m, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{m.tenant_subdomain || m.tenantSubdomain}.workforceos.com</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    DAU: {m.active_users || m.activeUsers} | MAU: {m.monthly_users || m.monthlyUsers} | API Volume: {m.api_calls_count || m.apiCallsCount} calls
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {m.churnRisk || 'LOW RISK'}
                </span>
              </div>
            ))}
            {metrics.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No usage metrics logged.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Log Tenant Metric Snapshot</h3>
          <form onSubmit={handleRecordMetric} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Tenant Subdomain</label>
              <input type="text" className={styles.input} placeholder="acme" value={subdomain} onChange={e => setSubdomain(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Daily Active Users (DAU)</label>
              <input type="number" className={styles.input} value={activeUsers} onChange={e => setActiveUsers(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Monthly Active Users (MAU)</label>
              <input type="number" className={styles.input} value={monthlyUsers} onChange={e => setMonthlyUsers(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Monthly API Call Count</label>
              <input type="number" className={styles.input} value={apiCalls} onChange={e => setApiCalls(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Record Usage Snapshot</button>
          </form>
        </div>
      </div>
    </div>
  );
}
