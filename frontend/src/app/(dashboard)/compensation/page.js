'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as compensationService from '../../../services/compensationService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function CompensationPage() {
  const [activeTab, setActiveTab] = useState('reviews'); // reviews, bands
  const [bands, setBands] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Form states
  const [newBand, setNewBand] = useState({ grade: '', minSalary: '', maxSalary: '', currency: 'USD' });
  const [newReview, setNewReview] = useState({ employeeId: '', currentSalary: '', proposedSalary: '', reason: '', effectiveDate: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    compensationService.getSalaryReviews()
      .then(res => setReviews(res || []))
      .catch(err => console.error(err));

    compensationService.getBands()
      .then(res => setBands(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBand = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newBand.grade.trim() || !newBand.minSalary || !newBand.maxSalary) {
      return setError('Grade, Min Salary, and Max Salary are required.');
    }

    startTransition(async () => {
      try {
        await compensationService.addBand(newBand);
        setMessage('Compensation band configuration successfully saved.');
        setNewBand({ grade: '', minSalary: '', maxSalary: '', currency: 'USD' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to save compensation band.');
      }
    });
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newReview.employeeId || !newReview.currentSalary || !newReview.proposedSalary) {
      return setError('Employee ID, Current Salary, and Proposed Salary are required.');
    }

    startTransition(async () => {
      try {
        await compensationService.submitReview(newReview);
        setMessage('Salary review proposal logged successfully.');
        setNewReview({ employeeId: '', currentSalary: '', proposedSalary: '', reason: '', effectiveDate: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to submit salary review.');
      }
    });
  };

  const handleActionReview = (reviewId, approve) => {
    setError('');
    setMessage('');
    const status = approve ? 'APPROVED' : 'REJECTED';

    startTransition(async () => {
      try {
        await compensationService.actionReview(reviewId, status);
        setMessage(`Salary review status set to ${status}.`);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to update review status.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Compensation Management</h1>
        <p className="page-subtitle">Configure salary grades, review bands compliance, and process merit increase approval cycles</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')} style={{ background: activeTab === 'reviews' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Salary Review Requests
        </button>
        <button className={`tab-btn ${activeTab === 'bands' ? 'active' : ''}`} onClick={() => setActiveTab('bands')} style={{ background: activeTab === 'bands' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Compensation Bands
        </button>
      </div>

      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Active Salary Revision Proposals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {reviews.map((r, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--accent-primary)' }}>{r.firstName} {r.lastName}</strong>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', background: r.status === 'PENDING' ? 'rgba(234,179,8,0.1)' : r.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: r.status === 'PENDING' ? '#eab308' : r.status === 'APPROVED' ? 'var(--accent-success)' : '#ef4444' }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Current: ${r.currentSalary.toLocaleString()}</span>
                    <span>Proposed: ${r.proposedSalary.toLocaleString()}</span>
                    <span style={{ color: r.meritPercentage >= 0 ? 'var(--accent-success)' : '#ef4444' }}>
                      Merit: {r.meritPercentage >= 0 ? '+' : ''}{r.meritPercentage}%
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Reason: {r.reason || 'None'} | Effective Date: {r.effectiveDate || 'Immediate'}
                  </div>
                  
                  {r.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button className={styles.btn} onClick={() => handleActionReview(r.id, true)} style={{ padding: '6px 12px', background: 'var(--accent-success)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>
                        Approve revision
                      </button>
                      <button className={styles.btn} onClick={() => handleActionReview(r.id, false)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>
                        Reject revision
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No revision records.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Propose Salary Revision</h3>
            <form onSubmit={handleAddReview} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Employee ID</label>
                <input type="text" className={styles.input} placeholder="e.g. employee-uuid" value={newReview.employeeId} onChange={e => setNewReview({ ...newReview, employeeId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Current Gross Salary ($)</label>
                <input type="number" className={styles.input} placeholder="e.g. 5000" value={newReview.currentSalary} onChange={e => setNewReview({ ...newReview, currentSalary: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Proposed Salary ($)</label>
                <input type="number" className={styles.input} placeholder="e.g. 5500" value={newReview.proposedSalary} onChange={e => setNewReview({ ...newReview, proposedSalary: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Effective Date</label>
                <input type="date" className={styles.input} value={newReview.effectiveDate} onChange={e => setNewReview({ ...newReview, effectiveDate: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Justification Reason</label>
                <textarea className={styles.input} placeholder="Performance merit or promotion basis..." value={newReview.reason} onChange={e => setNewReview({ ...newReview, reason: e.target.value })} disabled={isPending} style={{ minHeight: '80px' }} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Propose Salary Card</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'bands' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Active Compensation Bands</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Job Grade</th>
                  <th style={{ padding: '12px' }}>Min Salary</th>
                  <th style={{ padding: '12px' }}>Max Salary</th>
                  <th style={{ padding: '12px' }}>Currency</th>
                </tr>
              </thead>
              <tbody>
                {bands.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}><strong>{b.grade}</strong></td>
                    <td style={{ padding: '12px' }}>${b.minSalary.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>${b.maxSalary.toLocaleString()}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{b.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Configure Band</h3>
            <form onSubmit={handleAddBand} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Job Grade</label>
                <input type="text" className={styles.input} placeholder="e.g. Grade A" value={newBand.grade} onChange={e => setNewBand({ ...newBand, grade: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Min Salary ($)</label>
                <input type="number" className={styles.input} placeholder="e.g. 2000" value={newBand.minSalary} onChange={e => setNewBand({ ...newBand, minSalary: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Max Salary ($)</label>
                <input type="number" className={styles.input} placeholder="e.g. 6000" value={newBand.maxSalary} onChange={e => setNewBand({ ...newBand, maxSalary: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Currency Unit</label>
                <input type="text" className={styles.input} placeholder="USD" value={newBand.currency} onChange={e => setNewBand({ ...newBand, currency: e.target.value })} disabled={isPending} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Grade Band</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
