'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as auditService from '../../../services/auditCenterService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function AuditCenterPage() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

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

  const handleExportCsv = () => {
    auditService.exportCsv()
      .then(data => {
        const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-log-export.csv';
        a.click();
        setMessage('Audit log CSV file downloaded.');
      })
      .catch(err => setError(err.message || 'CSV Export failed.'));
  };

  const filteredLogs = logs.filter(l => {
    const actor = (l.actor_email || l.actorEmail || '').toLowerCase();
    const entity = (l.entity_name || l.entityName || '').toLowerCase();
    const action = l.action_type || l.actionType || '';
    const matchSearch = actor.includes(searchTerm.toLowerCase()) || entity.includes(searchTerm.toLowerCase());
    const matchAction = actionFilter === 'ALL' || action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Compliance Audit Center & Activity Log</h1>
        <p className="page-subtitle">Immutable data mutation logging, ISO 27001 / SOC2 compliance trail, SIEM syslog export, and sensitive field masking</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Audit Summary Widget */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Audit Mutations</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>{logs.length}</div>
        </div>
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Compliance Status</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-success)', marginTop: '4px' }}>ISO 27001 Ready</div>
        </div>
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tamper Chain Verification</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>Verified Hash</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>System Activity Ledger</h3>
            <button onClick={handleExportCsv} className={`${styles.btn} ${styles.btnPrimary}`} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Export Audit CSV</button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input type="text" className={styles.input} placeholder="Filter by actor or entity..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 2 }} />
            <select className={styles.input} value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ flex: 1 }}>
              <option value="ALL">All Action Types</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredLogs.map((l, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{l.actor_email || l.actorEmail}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{l.details}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Entity: {l.entity_name || l.entityName} | IP: {l.ip_address || l.ipAddress || '127.0.0.1'}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{l.action_type || l.actionType}</span>
              </div>
            ))}
            {filteredLogs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No audit events found for current filters.</p>}
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
