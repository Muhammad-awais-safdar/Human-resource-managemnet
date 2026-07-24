'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as superAdminService from '../../../../services/superAdminService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SuperAdminTenantsPage() {
  const [logs, setLogs] = useState([]);
  const [tenantName, setTenantName] = useState('');
  const [actionType, setActionType] = useState('PROVISION');
  const [details, setDetails] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    superAdminService.getLogs()
      .then(res => setLogs(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogAction = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!tenantName) return setError('Tenant name is required.');

    startTransition(async () => {
      try {
        await superAdminService.logTenantAction({ tenantName, actionType, details });
        setMessage('Super Admin tenant operation logged successfully.');
        setTenantName('');
        setDetails('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to log tenant action.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Super Admin Tenant Control Center</h1>
        <p className="page-subtitle">Platform-wide multi-tenant manager, tenant impersonation, suspension, provision logs, and database health</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Tenant Operations Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {logs.map((l, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{l.tenant_name || l.tenantName}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Action: {l.action_type || l.actionType} | Note: {l.details}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>COMPLETED</span>
              </div>
            ))}
            {logs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tenant audit logs recorded.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Manage Tenant Action</h3>
          <form onSubmit={handleLogAction} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Tenant Organization Name / Domain</label>
              <input type="text" className={styles.input} placeholder="acme.workforceos.com" value={tenantName} onChange={e => setTenantName(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Action</label>
              <select className={styles.input} value={actionType} onChange={e => setActionType(e.target.value)} disabled={isPending}>
                <option value="PROVISION">Provision New Tenant</option>
                <option value="SUSPEND">Suspend Tenant Access</option>
                <option value="REACTIVATE">Reactivate Tenant Access</option>
                <option value="IMPERSONATE">Log Impersonation Event</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Details / Reason</label>
              <input type="text" className={styles.input} placeholder="Enterprise agreement signed" value={details} onChange={e => setDetails(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Execute Tenant Action</button>
          </form>
        </div>
      </div>
    </div>
  );
}
