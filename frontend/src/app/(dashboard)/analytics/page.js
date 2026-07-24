'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as analyticsService from '../../../services/analyticsService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, attrition
  const [metrics, setMetrics] = useState([]);
  const [attritionList, setAttritionList] = useState([]);

  const [newMetric, setNewMetric] = useState({ metricKey: '', metricValue: 0, category: 'EXECUTIVE' });
  const [newAttrition, setNewAttrition] = useState({ periodYearMonth: '2026-07', totalHeadcount: 100, departedCount: 2 });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    analyticsService.getMetricSnapshots()
      .then(res => setMetrics(res || []))
      .catch(err => console.error(err));

    analyticsService.getAttritionTrends()
      .then(res => setAttritionList(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordMetric = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newMetric.metricKey) return setError('Metric key is required.');

    startTransition(async () => {
      try {
        await analyticsService.recordMetricSnapshot(newMetric);
        setMessage('Executive metric snapshot recorded.');
        setNewMetric({ metricKey: '', metricValue: 0, category: 'EXECUTIVE' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record metric.');
      }
    });
  };

  const handleRecordAttrition = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newAttrition.periodYearMonth) return setError('Period is required.');

    startTransition(async () => {
      try {
        await analyticsService.recordAttritionTrend(newAttrition);
        setMessage('Attrition trend recorded.');
        setNewAttrition({ periodYearMonth: '2026-07', totalHeadcount: 100, departedCount: 2 });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record attrition trend.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Workforce Analytics</h1>
        <p className="page-subtitle">Executive KPIs, headcount trends, diversity metrics, and departmental attrition reporting</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')} style={{ background: activeTab === 'metrics' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Executive KPI Snapshots
        </button>
        <button className={`tab-btn ${activeTab === 'attrition' ? 'active' : ''}`} onClick={() => setActiveTab('attrition')} style={{ background: activeTab === 'attrition' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Attrition & Retention Trends
        </button>
      </div>

      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Executive Metric Snapshots</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {metrics.map((m, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{m.metric_key || m.metricKey}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Category: {m.category}</div>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>{m.metric_value || m.metricValue}</span>
                </div>
              ))}
              {metrics.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No metrics recorded.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Record KPI Metric</h3>
            <form onSubmit={handleRecordMetric} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Metric Key</label>
                <input type="text" className={styles.input} placeholder="RETENTION_RATE_Q3" value={newMetric.metricKey} onChange={e => setNewMetric({ ...newMetric, metricKey: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Metric Value</label>
                <input type="number" step="0.01" className={styles.input} value={newMetric.metricValue} onChange={e => setNewMetric({ ...newMetric, metricValue: parseFloat(e.target.value) || 0 })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Category</label>
                <select className={styles.input} value={newMetric.category} onChange={e => setNewMetric({ ...newMetric, category: e.target.value })} disabled={isPending}>
                  <option value="EXECUTIVE">Executive</option>
                  <option value="HEADCOUNT">Headcount</option>
                  <option value="DIVERSITY">Diversity & Inclusion</option>
                  <option value="PRODUCTIVITY">Productivity</option>
                </select>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Record Metric</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'attrition' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Attrition Rate Trends</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {attritionList.map((a, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>Period: {a.period_year_month || a.periodYearMonth}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Total Headcount: {a.total_headcount || a.totalHeadcount} | Departed: {a.departed_count || a.departedCount}
                    </div>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>{a.attrition_rate || a.attritionRate}%</span>
                </div>
              ))}
              {attritionList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No attrition data logged.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Record Monthly Attrition</h3>
            <form onSubmit={handleRecordAttrition} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Period (YYYY-MM)</label>
                <input type="text" className={styles.input} placeholder="2026-07" value={newAttrition.periodYearMonth} onChange={e => setNewAttrition({ ...newAttrition, periodYearMonth: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Total Active Headcount</label>
                <input type="number" className={styles.input} value={newAttrition.totalHeadcount} onChange={e => setNewAttrition({ ...newAttrition, totalHeadcount: parseInt(e.target.value) || 0 })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Departed Count</label>
                <input type="number" className={styles.input} value={newAttrition.departedCount} onChange={e => setNewAttrition({ ...newAttrition, departedCount: parseInt(e.target.value) || 0 })} disabled={isPending} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Record Attrition</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
