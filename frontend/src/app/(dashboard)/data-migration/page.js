'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as migrationService from '../../../services/dataMigrationService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function DataMigrationPage() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ sourceSystem: 'CSV_IMPORT', targetEntity: 'EMPLOYEE', totalRecords: 50 });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    migrationService.getMigrationJobs()
      .then(res => setJobs(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteMigration = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newJob.totalRecords <= 0) return setError('Total records must be greater than zero.');

    startTransition(async () => {
      try {
        await migrationService.executeMigrationJob(newJob);
        setMessage('Data migration job executed successfully.');
        setNewJob({ sourceSystem: 'CSV_IMPORT', targetEntity: 'EMPLOYEE', totalRecords: 50 });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to execute migration job.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Enterprise Data Migration</h1>
        <p className="page-subtitle">CSV / Excel bulk import engine, legacy HRIS migration tools, duplicate detection, and execution logs</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Migration Execution Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {jobs.map((j, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{j.source_system || j.sourceSystem} ➔ {j.target_entity || j.targetEntity}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Total: {j.total_records || j.totalRecords} | Successful: {j.successful_records || j.successfulRecords} | Failed: {j.failed_records || j.failedRecords || 0}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{j.status}</span>
              </div>
            ))}
            {jobs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No migration jobs executed yet.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Run Migration Job</h3>
          <form onSubmit={handleExecuteMigration} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Source Format</label>
              <select className={styles.input} value={newJob.sourceSystem} onChange={e => setNewJob({ ...newJob, sourceSystem: e.target.value })} disabled={isPending}>
                <option value="CSV_IMPORT">CSV Bulk Import</option>
                <option value="EXCEL_IMPORT">Excel Workbook (.xlsx)</option>
                <option value="LEGACY_HRIS">Legacy HRIS System Export</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Target Entity</label>
              <select className={styles.input} value={newJob.targetEntity} onChange={e => setNewJob({ ...newJob, targetEntity: e.target.value })} disabled={isPending}>
                <option value="EMPLOYEE">Employee Profiles</option>
                <option value="PAYROLL">Historical Payroll Records</option>
                <option value="LEAVE">Leave Entitlements</option>
                <option value="DOCUMENT">Document Metadata</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Batch Record Count</label>
              <input type="number" className={styles.input} min="1" value={newJob.totalRecords} onChange={e => setNewJob({ ...newJob, totalRecords: parseInt(e.target.value) || 1 })} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Run Migration</button>
          </form>
        </div>
      </div>
    </div>
  );
}
