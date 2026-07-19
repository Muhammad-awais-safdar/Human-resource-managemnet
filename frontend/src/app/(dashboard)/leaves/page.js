'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as leaveService from '../../../services/leaveService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function LeavesPage() {
  const [policies, setPolicies] = useState([]);
  const [requests, setRequests] = useState([]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    leaveService.getPolicies()
      .then(res => setPolicies(res))
      .catch(err => console.error(err));

    leaveService.getRequests()
      .then(res => setRequests(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (requestId, approved) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await leaveService.updateRequestStatus(requestId, {
          status: approved ? 'APPROVED' : 'REJECTED',
        });
        if (res.success) {
          setMessage(`Leave application status successfully updated.`);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to update leave status.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Leaves & Vacation Control</h1>
        <p className="page-subtitle">Administer annual vacation allocations, approve leave applications, and view team calendar blocks</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        
        {/* Vacation policies allowance card */}
        <div className="form-card" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
          <h3>Vacation Policy Allowances</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leave allocations granted to dynamic company employees.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {policies.map(p => (
              <div key={p.id} style={{ padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{p.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.description}</div>
                </div>
                <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '1.1rem' }}>{p.allowance} Days</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requests & Approvals checklist */}
        <div className="form-card" style={{ flex: 2, minWidth: '400px', margin: 0 }}>
          <h3>Leave Applications Approvals</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {requests.map(req => (
              <div key={req.id} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#fff' }}>{req.firstName} {req.lastName}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: req.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: req.status === 'APPROVED' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                    {req.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Type: {req.policyName} | Range: {req.startDate} to {req.endDate}
                </div>
                {req.reason && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Reason: "{req.reason}"</div>}

                {req.status === 'PENDING' && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleApprove(req.id, true)} 
                      className={`${styles.btn} ${styles.btnPrimary}`} 
                      style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      disabled={isPending}
                    >
                      Approve Request
                    </button>
                    <button 
                      onClick={() => handleApprove(req.id, false)} 
                      className={styles.btn} 
                      style={{ padding: '6px 14px', fontSize: '0.75rem', background: 'var(--accent-danger)', border: 'none', color: '#fff' }}
                      disabled={isPending}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {requests.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '24px' }}>No leave requests filed.</p>
            )}
          </div>
        </div>

      </div>

      {/* Visual Team Leave Calendar */}
      <div className="form-card">
        <h3>Overlapping Team Leave Calendar</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Active timeline mappings of overlapping vacation blocks across the organization.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--bg-tertiary)' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-muted)', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
              {day}
            </div>
          ))}
          {Array.from({ length: 14 }).map((_, idx) => {
            const dayNum = idx + 1;
            // Mock some leaves spanning on this mockup view
            const hasLeaves = requests.filter(r => r.status === 'APPROVED');
            return (
              <div key={idx} style={{ minHeight: '80px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '6px', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>July {dayNum}</span>
                {dayNum >= 3 && dayNum <= 8 && hasLeaves.slice(0, 1).map(l => (
                  <div key={l.id} style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '3px 6px', borderRadius: '3px', marginTop: '4px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ✈ {l.firstName} ({l.policyName})
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
