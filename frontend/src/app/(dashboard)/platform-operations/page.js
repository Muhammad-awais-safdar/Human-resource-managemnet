'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as opsService from '../../../services/platformOperationsService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function PlatformOperationsPage() {
  const [logs, setLogs] = useState([]);
  const [opName, setOpName] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    opsService.getLogs()
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
    if (!opName) return setError('Operation name is required.');

    startTransition(async () => {
      try {
        await opsService.recordLog({ operationName: opName, moduleName: 'SCHEDULER', executionTimeMs: 42 });
        setMessage('System operation logged.');
        setOpName('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record operation log.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Platform Operations & System Health</h1>
        <p className="page-subtitle">Tenant health monitoring, queue status, background job schedulers, and audit log telemetry</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Background Jobs & Health Telemetry</h3>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
              ⚡ TELEMETRY ONLINE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
            {logs.length > 0 ? (
              logs.map((l, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>
                      {l.message || l.operationName || l.operation_name || 'System Operation'}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Module: <span style={{ color: '#38bdf8' }}>{l.module || l.moduleName || l.module_name || 'CORE'}</span>
                      {l.executionTimeMs || l.execution_time_ms ? (
                        <> | Latency: <span style={{ color: '#f59e0b' }}>{l.executionTimeMs || l.execution_time_ms} ms</span></>
                      ) : null}
                      {l.ip ? <> | IP: {l.ip}</> : null}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {l.level || l.status || 'SUCCESS'}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                No platform operation logs recorded.
              </p>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Log Operational Test Event</h3>
          <form onSubmit={handleRecordLog} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Job / Service Name</label>
              <input type="text" className={styles.input} placeholder="Daily Attendance Auto-Close Cron" value={opName} onChange={e => setOpName(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Log Event</button>
          </form>
        </div>
      </div>
    </div>
  );
}
