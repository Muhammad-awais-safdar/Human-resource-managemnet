'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as approvalService from '../../../services/unifiedApprovalService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ApprovalsPage() {
  const [counts, setCounts] = useState({ totalPending: 0, leaveCount: 0, expenseCount: 0, travelCount: 0, timesheetCount: 0 });
  const [delegations, setDelegations] = useState([]);
  const [delegator, setDelegator] = useState('manager@workforceos.com');
  const [delegatee, setDelegatee] = useState('deputy@workforceos.com');
  const [reason, setReason] = useState('Vacation leave handover');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    approvalService.getPendingCounts()
      .then(res => setCounts(res || {}))
      .catch(err => console.error(err));

    approvalService.getDelegations()
      .then(res => setDelegations(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelegate = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!delegator || !delegatee) return setError('Both delegator and delegatee emails are required.');

    startTransition(async () => {
      try {
        await approvalService.delegateApproval({ delegatorEmail: delegator, delegateeEmail: delegatee, reason });
        setMessage('Approval responsibility delegated successfully.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to delegate approval.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Unified Approvals Inbox</h1>
        <p className="page-subtitle">Centralized manager approval portal for Leave, Expenses, Travel, Timesheets, and Clearance requests</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Leave Requests</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>{counts.leaveCount || 0}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Expenses</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>{counts.expenseCount || 0}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Travel Requests</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>{counts.travelCount || 0}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Timesheets</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>{counts.timesheetCount || 0}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>Approval Delegation Rules</h3>
          <form onSubmit={handleDelegate} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Delegator Manager Email</label>
              <input type="email" className={styles.input} value={delegator} onChange={e => setDelegator(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Delegate To (Substitute Manager)</label>
              <input type="email" className={styles.input} value={delegatee} onChange={e => setDelegatee(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Reason / Period</label>
              <input type="text" className={styles.input} value={reason} onChange={e => setReason(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Delegate Approval Rights</button>
          </form>
        </div>

        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>Active Delegation Log</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.isArray(delegations) && delegations.length > 0 ? delegations.map((d, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{d.delegator_email || d.delegatorEmail} ➔ {d.delegatee_email || d.delegateeEmail}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reason: {d.reason}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{d.status}</span>
              </div>
            )) : null}
            {delegations.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No active manager delegation rules configured.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
