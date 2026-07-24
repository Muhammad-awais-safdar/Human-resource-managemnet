'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as devService from '../../../services/developerPlatformService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function DeveloperPlatformPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({ eventType: 'employee.created', targetUrl: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    devService.getWebhooks()
      .then(res => setWebhooks(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterWebhook = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newWebhook.targetUrl) return setError('Target URL is required.');

    startTransition(async () => {
      try {
        await devService.registerWebhook(newWebhook);
        setMessage('Webhook endpoint registered.');
        setNewWebhook({ eventType: 'employee.created', targetUrl: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to register webhook.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Developer Platform & Webhooks</h1>
        <p className="page-subtitle">Event subscriptions, real-time webhooks, sandbox tenant access, and developer CLI tools</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Registered Webhook Endpoints</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {webhooks.map((w, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>Event: {w.event_type || w.eventType}</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{w.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>URL: {w.target_url || w.targetUrl}</div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '4px' }}>Secret: {w.secret_key || w.secretKey}</div>
              </div>
            ))}
            {webhooks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No webhooks registered.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Register Webhook Endpoint</h3>
          <form onSubmit={handleRegisterWebhook} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Event Subscription</label>
              <select className={styles.input} value={newWebhook.eventType} onChange={e => setNewWebhook({ ...newWebhook, eventType: e.target.value })} disabled={isPending}>
                <option value="employee.created">employee.created</option>
                <option value="leave.approved">leave.approved</option>
                <option value="payroll.processed">payroll.processed</option>
                <option value="incident.reported">incident.reported</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Target Endpoint URL</label>
              <input type="text" className={styles.input} placeholder="https://api.yourcompany.com/webhooks/hr" value={newWebhook.targetUrl} onChange={e => setNewWebhook({ ...newWebhook, targetUrl: e.target.value })} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Register Endpoint</button>
          </form>
        </div>
      </div>
    </div>
  );
}
