'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as visitorService from '../../../services/visitorService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [newVisitor, setNewVisitor] = useState({ visitorName: '', email: '', phone: '', company: '', purpose: '' });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    visitorService.getVisitors()
      .then(res => setVisitors(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newVisitor.visitorName) {
      return setError('Visitor name is required.');
    }

    startTransition(async () => {
      try {
        await visitorService.registerVisitor(newVisitor);
        setMessage('Visitor pass generated successfully.');
        setNewVisitor({ visitorName: '', email: '', phone: '', company: '', purpose: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to register visitor.');
      }
    });
  };

  const handleCheckIn = (id) => {
    startTransition(async () => {
      try {
        await visitorService.checkInVisitor(id);
        setMessage('Visitor checked in.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to check in visitor.');
      }
    });
  };

  const handleCheckOut = (id) => {
    startTransition(async () => {
      try {
        await visitorService.checkOutVisitor(id);
        setMessage('Visitor checked out.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to check out visitor.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Visitor Management</h1>
        <p className="page-subtitle">Register guests, issue QR visitor passes, track security clearance, and monitor check-ins</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Active & Historical Visitors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {visitors.map((v, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{v.visitor_name || v.visitorName} ({v.company || 'Guest'})</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Pass Code: <code>{v.qr_pass_code || v.qrPassCode}</code> | Purpose: {v.purpose || 'Meeting'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    In: {v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString() : 'N/A'} | Out: {v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{v.status}</span>
                  {v.status === 'PENDING' && (
                    <button onClick={() => handleCheckIn(v.id)} className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '6px 10px', fontSize: '0.8rem' }} disabled={isPending}>Check In</button>
                  )}
                  {v.status === 'CHECKED_IN' && (
                    <button onClick={() => handleCheckOut(v.id)} className={styles.btn} style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'var(--accent-warning)', color: '#fff' }} disabled={isPending}>Check Out</button>
                  )}
                </div>
              </div>
            ))}
            {visitors.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No visitors registered today.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Register New Visitor</h3>
          <form onSubmit={handleRegister} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Visitor Full Name</label>
              <input type="text" className={styles.input} placeholder="John Doe" value={newVisitor.visitorName} onChange={e => setNewVisitor({ ...newVisitor, visitorName: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Email Address</label>
              <input type="email" className={styles.input} placeholder="john@example.com" value={newVisitor.email} onChange={e => setNewVisitor({ ...newVisitor, email: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Company / Organization</label>
              <input type="text" className={styles.input} placeholder="Acme Corp" value={newVisitor.company} onChange={e => setNewVisitor({ ...newVisitor, company: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Visit Purpose</label>
              <textarea className={styles.input} rows="3" placeholder="Executive Briefing & Project Audit" value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} disabled={isPending}></textarea>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Issue QR Pass</button>
          </form>
        </div>
      </div>
    </div>
  );
}
