'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as ssoService from '../../../../services/ssoService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SsoSettingsPage() {
  const [config, setConfig] = useState({
    idpName: 'OKTA',
    ssoUrl: 'https://dev-12345.okta.com/app/sso',
    entityId: 'urn:workforceos:sp',
    isEnforced: false,
    scimEnabled: true
  });
  const [logs, setLogs] = useState([]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    ssoService.getSsoConfig()
      .then(res => { if (res && res.ssoUrl) setConfig(res); })
      .catch(err => console.error(err));

    ssoService.getAuditLogs()
      .then(res => setLogs(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSso = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!config.ssoUrl) return setError('SSO URL is required.');

    startTransition(async () => {
      try {
        await ssoService.updateSsoConfig(config);
        setMessage('SAML / Enterprise SSO configuration saved.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to update SSO configuration.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">SSO & Enterprise Authentication</h1>
        <p className="page-subtitle">SAML 2.0 / Okta / Azure AD integration, SCIM 2.0 provisioning, JIT user creation, and login audit log</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>Single Sign-On (IdP) Setup Wizard</h3>
          <form onSubmit={handleSaveSso} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Identity Provider (IdP)</label>
              <select className={styles.input} value={config.idpName} onChange={e => setConfig({ ...config, idpName: e.target.value })} disabled={isPending}>
                <option value="OKTA">Okta SSO</option>
                <option value="AZURE_AD">Microsoft Entra ID (Azure AD)</option>
                <option value="GOOGLE_WORKSPACE">Google Workspace SAML</option>
                <option value="SAML_GENERIC">Generic SAML 2.0</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>IdP Single Sign-On Target URL</label>
              <input type="text" className={styles.input} value={config.ssoUrl} onChange={e => setConfig({ ...config, ssoUrl: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>SP Entity ID</label>
              <input type="text" className={styles.input} value={config.entityId} onChange={e => setConfig({ ...config, entityId: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={config.isEnforced} onChange={e => setConfig({ ...config, isEnforced: e.target.checked })} disabled={isPending} />
                Enforce Mandatory SSO Login (Block Password Auth)
              </label>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={config.scimEnabled} onChange={e => setConfig({ ...config, scimEnabled: e.target.checked })} disabled={isPending} />
                Enable SCIM 2.0 Automatic User Provisioning
              </label>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save SSO Settings</button>
          </form>
        </div>

        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>SSO Security & Login Audit Stream</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((l, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{l.email}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provider: {l.idp_provider || l.idpProvider}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{l.status}</span>
              </div>
            ))}
            {logs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent SSO login audit events recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
