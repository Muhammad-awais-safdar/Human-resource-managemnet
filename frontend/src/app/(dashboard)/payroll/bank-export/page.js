'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as bankPayrollService from '../../../../services/bankPayrollService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function BankPayrollExportPage() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState('');
  const [periodMonth, setPeriodMonth] = useState('2026-08');
  const [totalAmount, setTotalAmount] = useState(120000);
  const [exportOutput, setExportOutput] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    bankPayrollService.getBankBatches()
      .then(res => setBatches(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!batchName) return setError('Batch name is required.');

    startTransition(async () => {
      try {
        await bankPayrollService.createBatch({ batchName, periodMonth, totalAmount: parseFloat(totalAmount) || 0 });
        setMessage('Bank disbursement batch created and locked.');
        setBatchName('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create batch.');
      }
    });
  };

  const handleExport = (batchId, format) => {
    setError('');
    bankPayrollService.exportFile(batchId, format)
      .then(res => {
        setExportOutput(res.fileContent);
        setMessage(`Exported ${format} file successfully.`);
      })
      .catch(err => setError(err.message || 'Export failed.'));
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Payroll Bank Integration & Direct Deposit</h1>
        <p className="page-subtitle">Export NACHA ACH (US), BACS (UK), and SIF (GCC) bank transfer files, direct deposit records, and payroll lock controls</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Locked Payroll Disbursement Batches</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {batches.map((b, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{b.batch_name || b.batchName}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Period: {b.period_month || b.periodMonth} | Net Disbursement: ${b.total_amount || b.totalAmount}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleExport(b.id, 'NACHA')} className={`${styles.btn} ${styles.btnPrimary}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>NACHA (US)</button>
                  <button onClick={() => handleExport(b.id, 'BACS')} className={`${styles.btn} ${styles.btnPrimary}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>BACS (UK)</button>
                  <button onClick={() => handleExport(b.id, 'SIF')} className={`${styles.btn} ${styles.btnPrimary}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>SIF (GCC)</button>
                </div>
              </div>
            ))}
            {batches.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bank disbursement batches recorded.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>New Bank Batch</h3>
          <form onSubmit={handleCreateBatch} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Batch Title</label>
              <input type="text" className={styles.input} placeholder="August Executive Payroll" value={batchName} onChange={e => setBatchName(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Payroll Month</label>
              <input type="text" className={styles.input} value={periodMonth} onChange={e => setPeriodMonth(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Total Gross Amount ($)</label>
              <input type="number" className={styles.input} value={totalAmount} onChange={e => setTotalAmount(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Create & Lock Batch</button>
          </form>
        </div>
      </div>

      {exportOutput && (
        <div className="form-card">
          <h3>Generated Bank Transfer File Stream</h3>
          <pre style={{ marginTop: '12px', padding: '16px', background: '#0d1117', color: '#58a6ff', borderRadius: '6px', overflowX: 'auto' }}>
            {exportOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
