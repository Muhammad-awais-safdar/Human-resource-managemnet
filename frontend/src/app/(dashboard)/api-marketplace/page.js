'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as apiMarketplaceService from '../../../services/apiMarketplaceService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ApiMarketplacePage() {
  const [keys, setKeys] = useState([]);
  const [keyName, setKeyName] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    apiMarketplaceService.getApiKeys()
      .then(res => setKeys(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateKey = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!keyName) return setError('Key Name is required.');

    startTransition(async () => {
      try {
        await apiMarketplaceService.generateApiKey({ keyName });
        setMessage('API Key generated successfully.');
        setKeyName('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to generate API Key.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">API Marketplace</h1>
        <p className="page-subtitle">Public APIs, SDK downloads, API Key management, and OAuth client credentials</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Active API Tokens</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {keys.map((k, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{k.key_name || k.keyName}</strong>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '4px' }}>{k.api_key || k.apiKey}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{k.status}</span>
              </div>
            ))}
            {keys.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No API tokens generated.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Generate API Key</h3>
          <form onSubmit={handleGenerateKey} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Token Label / Purpose</label>
              <input type="text" className={styles.input} placeholder="Salesforce Sync Key" value={keyName} onChange={e => setKeyName(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Generate Key</button>
          </form>
        </div>
      </div>
    </div>
  );
}
