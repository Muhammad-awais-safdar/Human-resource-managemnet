'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as auditService from '../../../services/auditCenterService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function AuditCenterPage() {
  const [logs, setLogs] = useState([]);
  const [actorEmail, setActorEmail] = useState('sec.audit@workforceos.com');
  const [actionType, setActionType] = useState('UPDATE');
  const [entityName, setEntityName] = useState('EmployeeSalary');
  const [details, setDetails] = useState('Revised base salary package and allowance structure');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    auditService.getLogs()
      .then(res => setLogs(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordLog = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!actorEmail || !actionType) return setError('Actor email and action type are required.');

    startTransition(async () => {
      try {
        await auditService.recordAuditLog({ actorEmail, actionType, entityName, details });
        setMessage('Security audit record appended to tamper-evident ledger.');
        setDetails('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record audit log.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Compliance Audit Center & Activity Log</h1>
        <p className="page-subtitle">Immutable data mutation logging, ISO 27001 / SOC2 compliance trail, SIEM syslog export, and sensitive field masking</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>System Activity Ledger</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((l, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{l.actor_email || l.actorEmail}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{l.details}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Entity: {l.entity_name || l.entityName} | IP: {l.ip_address || l.ipAddress || '127.0.0.1'}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{l.action_type || l.actionType}</span>
              </div>
            ))}
            {logs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No audit events recorded.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Inject Audit Record</h3>
          <form onSubmit={handleRecordLog} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Actor Email</label>
              <input type="email" className={styles.input} value={actorEmail} onChange={e => setActorEmail(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Action Type</label>
              <select className={styles.input} value={actionType} onChange={e => setActionType(e.target.value)} disabled={isPending}>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="EXPORT">EXPORT</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Target Entity</label>
              <input type="text" className={styles.input} value={entityName} onChange={e => setEntityName(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Mutation Description</label>
              <textarea className={styles.input} rows="3" value={details} onChange={e => setDetails(e.target.value)} disabled={isPending}></textarea>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Append Audit Log</button>
          </form>
        </div>
      </div>
    </div>
  );
}
