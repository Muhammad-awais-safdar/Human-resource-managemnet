'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as bcService from '../../../services/businessContinuityService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function BusinessContinuityPage() {
  const [backups, setBackups] = useState([]);
  const [backupName, setBackupName] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    bcService.getBackups()
      .then(res => setBackups(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerBackup = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!backupName) return setError('Backup snapshot name is required.');

    startTransition(async () => {
      try {
        await bcService.triggerBackup({ backupName, backupType: 'MANUAL', sizeBytes: 25165824 });
        setMessage('Disaster Recovery snapshot generated.');
        setBackupName('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to trigger DR backup.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Business Continuity & Disaster Recovery</h1>
        <p className="page-subtitle">Automated backups, DR failover status, database point-in-time recovery, and multi-region replication</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Database Backup & DR Snapshots</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {backups.map((b, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{b.backup_name || b.backupName}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Type: {b.backup_type || b.backupType} | Size: {Math.round(((b.size_bytes || b.sizeBytes || 1048576) / (1024 * 1024)) * 10) / 10} MB
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{b.status}</span>
              </div>
            ))}
            {backups.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No DR backup snapshots generated.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Create Manual DR Snapshot</h3>
          <form onSubmit={handleTriggerBackup} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Snapshot Description / Label</label>
              <input type="text" className={styles.input} placeholder="Pre-Upgrade Full Backup Snapshot" value={backupName} onChange={e => setBackupName(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Take DR Snapshot</button>
          </form>
        </div>
      </div>
    </div>
  );
}
