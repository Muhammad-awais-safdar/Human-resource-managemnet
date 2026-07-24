'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as analyticsService from '../../../../services/tenantAnalyticsService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function TenantAnalyticsPage() {
  const [overview, setOverview] = useState({ monthlyRecurringRevenue: 45000, annualRecurringRevenue: 540000, activeTenantsCount: 48, activeUsersCount: 1250, totalApiCalls: 845000, healthScore: '96.4%' });
  const [churnRisks, setChurnRisks] = useState([]);

  const [tenantId, setTenantId] = useState('');
  const [activeUsers, setActiveUsers] = useState(25);
  const [apiCalls, setApiCalls] = useState(12000);
  const [mrrAmount, setMrrAmount] = useState(1499);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    analyticsService.getSaaSOverview()
      .then(res => { if (res) setOverview(res); })
      .catch(err => console.error(err));

    analyticsService.getChurnRisks()
      .then(res => setChurnRisks(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordMetric = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!tenantId) return setError('Tenant ID is required.');

    startTransition(async () => {
      try {
        await analyticsService.recordMetric({ tenantId, activeUsers: parseInt(activeUsers) || 0, apiCalls: parseInt(apiCalls) || 0, mrrAmount: parseFloat(mrrAmount) || 0 });
        setMessage('Tenant usage metric recorded and rollup refreshed.');
        setTenantId('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record metric.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Tenant Analytics & SaaS Product Metrics</h1>
        <p className="page-subtitle">SaaS MRR/ARR growth tracking, DAU/MAU adoption rates, feature engagement heatmaps, and AI churn risk indicators</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly Recurring Revenue (MRR)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-success)', marginTop: '6px' }}>${overview.monthlyRecurringRevenue?.toLocaleString()}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Annual Run Rate (ARR)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '6px' }}>${overview.annualRecurringRevenue?.toLocaleString()}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Platform Tenants</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '6px' }}>{overview.activeTenantsCount}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total API Call Volume</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-warning)', marginTop: '6px' }}>{overview.totalApiCalls?.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Tenant Health & Churn Risk Radar</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {churnRisks.map((c, idx) => {
              const risk = c.risk_level || c.riskLevel || 'LOW';
              const isHigh = risk === 'HIGH' || risk === 'CRITICAL';
              return (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{c.tenant_name || c.tenantName}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Calculated Churn Probability: {c.churn_risk_score || c.churnRiskScore}%
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: isHigh ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isHigh ? 'var(--accent-danger)' : 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {risk} RISK
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Record Tenant Telemetry</h3>
          <form onSubmit={handleRecordMetric} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Tenant Identifier / Subdomain</label>
              <input type="text" className={styles.input} placeholder="acme-corp" value={tenantId} onChange={e => setTenantId(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Monthly Active Users (MAU)</label>
              <input type="number" className={styles.input} value={activeUsers} onChange={e => setActiveUsers(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Monthly API Calls</label>
              <input type="number" className={styles.input} value={apiCalls} onChange={e => setApiCalls(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Subscription MRR ($)</label>
              <input type="number" className={styles.input} value={mrrAmount} onChange={e => setMrrAmount(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Record Usage Event</button>
          </form>
        </div>
      </div>
    </div>
  );
}
