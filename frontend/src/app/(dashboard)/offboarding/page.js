'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as offboardingService from '../../../services/offboardingService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function OffboardingPage() {
  const [resignations, setResignations] = useState([]);
  const [reason, setReason] = useState('');
  
  // Settle Modal/Form States
  const [activeSettleId, setActiveSettleId] = useState(null);
  const [exitFeedback, setExitFeedback] = useState('');
  const [customSettlement, setCustomSettlement] = useState('0');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    offboardingService.getResignations()
      .then(res => setResignations(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitResignation = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!reason.trim()) return setError('Please specify a reason for resignation.');

    startTransition(async () => {
      try {
        const res = await offboardingService.submitResignation({ reason });
        if (res.success) {
          setMessage('Your resignation request has been logged and sent to HR.');
          setReason('');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to submit resignation.');
      }
    });
  };

  const handleSettleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        // Fetch to settle endpoint: POST /suite/offboarding/resignations/{id}/settle
        const response = await fetch(`http://localhost:3000/api/v1/suite/offboarding/resignations/${activeSettleId}/settle?exitFeedback=${encodeURIComponent(exitFeedback)}&settlementAmount=${parseFloat(customSettlement) || 0}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        
        if (data.status === 200 || data.success) {
          setMessage('Resignation settlement calculations finalized.');
          setActiveSettleId(null);
          setExitFeedback('');
          setCustomSettlement('0');
          loadData();
        } else {
          setError(data.message || 'Failed to settle resignation');
        }
      } catch (err) {
        setError('Connection failed. Verify API server status.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Offboarding Clearance Center</h1>
        <p className="page-subtitle">File resignation requests, review exit interviews, and run final payroll settlements calculations</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        
        {/* Submit Resignation Request Form */}
        <div className="form-card" style={{ flex: 1, minWidth: '320px', margin: 0 }}>
          <h3>File New Resignation</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Provide formal notice of resignation and set your exit timeline.</p>
          <form onSubmit={handleSubmitResignation} noValidate>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Reason for Departure</label>
              <textarea 
                className={styles.input} 
                rows="4"
                placeholder="e.g. Better opportunity, relocation, etc."
                value={reason}
                onChange={e => setReason(e.target.value)}
                disabled={isPending}
                style={{ resize: 'none', background: 'var(--bg-tertiary)' }}
              />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
              Submit Resignation Notice
            </button>
          </form>
        </div>

        {/* Resignation Logs / Action list */}
        <div className="form-card" style={{ flex: 2, minWidth: '400px', margin: 0 }}>
          <h3>Clearance History & Logs</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {resignations.map(res => (
              <div 
                key={res.id} 
                style={{ 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                    {res.firstName} {res.lastName}
                  </strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: res.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: res.status === 'APPROVED' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                    {res.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Reason: "{res.reason}"
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Resignation: {res.resignationDate} | Target Exit: {res.lastWorkingDate}
                </div>

                {res.finalSettlementAmount > 0 && (
                  <div style={{ background: 'rgba(99, 102, 241, 0.06)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginTop: '12px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                      Final Settlement Amount: ${res.finalSettlementAmount}
                    </div>
                    {res.exitInterviewFeedback && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Exit Feedback: "{res.exitInterviewFeedback}"
                      </div>
                    )}
                  </div>
                )}

                {res.status === 'PENDING' && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setActiveSettleId(res.id)}
                      className={`${styles.btn}`}
                      style={{ padding: '6px 14px', fontSize: '0.75rem', border: '1px solid var(--border-light)', background: 'none', color: '#fff' }}
                      disabled={isPending}
                    >
                      Process Final Settlement
                    </button>
                  </div>
                )}
              </div>
            ))}
            {resignations.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '24px' }}>No offboarding logs mapped.</p>
            )}
          </div>
        </div>

      </div>

      {/* Settle resignation details overlay card */}
      {activeSettleId && (
        <div className="form-card" style={{ maxWidth: '600px', border: '1px solid var(--accent-primary)', background: 'rgba(9,9,11,0.98)' }}>
          <h3>Process Exit Settlement Calculator</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Run offboarding calculations and register final compliance feedback records.</p>
          <form onSubmit={handleSettleSubmit} noValidate>
            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <label className={styles.label}>Exit Interview Feedback Log</label>
              <textarea 
                className={styles.input} 
                rows="3" 
                placeholder="Log comments or notes from exit interview..."
                value={exitFeedback}
                onChange={e => setExitFeedback(e.target.value)}
                disabled={isPending}
                style={{ resize: 'none', background: 'var(--bg-tertiary)' }}
              />
            </div>
            
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Custom Settlement Amount Payout ($)</label>
              <input 
                type="number" 
                className={styles.input} 
                placeholder="e.g. 5000 (leave empty to auto-calculate base monthly rate)" 
                value={customSettlement}
                onChange={e => setCustomSettlement(e.target.value)}
                disabled={isPending}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>Leaving this empty/0 will query the database to auto-calculate settlement basic + allowance - deductions.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
                Approve & Settle Clearance
              </button>
              <button 
                type="button" 
                onClick={() => setActiveSettleId(null)}
                className={styles.btn} 
                style={{ background: 'none', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                disabled={isPending}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
