'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as leaveService from '../../../services/leaveService';
import * as attendanceService from '../../../services/attendanceService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ESSPage() {
  // Attendance States
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  
  // Leave States
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    // Get policies
    leaveService.getPolicies()
      .then(res => {
        setPolicies(res);
        if (res.length > 0) setSelectedPolicy(res[0].id);
      })
      .catch(err => console.error(err));

    // Get leaves history
    leaveService.getRequests()
      .then(res => setLeaveRequests(res))
      .catch(err => console.error(err));

    // Get attendance logs
    attendanceService.getAttendanceHistory()
      .then(res => {
        setAttendanceLogs(res);
        const active = res.find(r => r.checkOut === null);
        setIsCheckedIn(!!active);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = () => {
    setError('');
    setMessage('');
    setBiometricScanning(true);

    setTimeout(() => {
      setBiometricScanning(false);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sendCheckIn(position.coords.latitude, position.coords.longitude);
          },
          () => {
            sendCheckIn(33.6844, 73.0479);
          }
        );
      } else {
        sendCheckIn(33.6844, 73.0479);
      }
    }, 2500);
  };

  const sendCheckIn = (latitude, longitude) => {
    startTransition(async () => {
      try {
        const res = await attendanceService.checkIn({ latitude, longitude });
        if (res.success) {
          setMessage(res.message);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Check-in failed');
      }
    });
  };

  const handleCheckOut = () => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await attendanceService.checkOut();
        if (res.success) {
          setMessage(res.message);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Check-out failed');
      }
    });
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!startDate || !endDate) return setError('Dates are required.');

    startTransition(async () => {
      try {
        const res = await leaveService.submitRequest({
          policyId: selectedPolicy,
          startDate,
          endDate,
          reason,
        });

        if (res.success) {
          setMessage('Leave request submitted for approvals.');
          setStartDate('');
          setEndDate('');
          setReason('');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to submit leave.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Employee Portal (ESS)</h1>
        <p className="page-subtitle">Manage your attendance logging and apply for vacation leaves</p>
      </header>

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {message && (
        <div className={`${styles.alert}`} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', marginBottom: '24px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        
        {/* Check-In Biometric Portal */}
        <div className="form-card" style={{ flex: 1, minWidth: '320px', textAlign: 'center' }}>
          <h3>Daily Check-In</h3>
          
          {biometricScanning ? (
            <div>
              <div className="biometric-scanner-container">
                <div className="biometric-scanner-laser" />
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                Verifying biometric credentials context...
              </p>
            </div>
          ) : (
            <div style={{ padding: '24px 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🕒</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                {isCheckedIn ? 'Checked in: Active session logged' : 'Not checked in today'}
              </p>
              
              {!isCheckedIn ? (
                <button onClick={handleCheckIn} className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
                  Trigger Biometric Check-In
                </button>
              ) : (
                <button onClick={handleCheckOut} className={styles.btn} style={{ background: 'var(--accent-danger)', border: 'none', color: '#fff' }} disabled={isPending}>
                  Submit Check-Out Log
                </button>
              )}
            </div>
          )}
        </div>

        {/* Leave Request Form */}
        <div className="form-card" style={{ flex: 2, minWidth: '400px' }}>
          <h3>Request Time Off</h3>
          <form onSubmit={handleLeaveSubmit} noValidate>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Vacation Policy</label>
                <select 
                  className={styles.input}
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  style={{ appearance: 'none', background: 'var(--bg-tertiary)' }}
                  disabled={isPending}
                >
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.allowance} Days)</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Start Date</label>
                <input 
                  type="date" 
                  className={styles.input} 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>End Date</label>
                <input 
                  type="date" 
                  className={styles.input} 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Reason</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="e.g. Annual family trip" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                disabled={isPending}
              />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
              Submit Application
            </button>
          </form>
        </div>
      </div>

      {/* Attendance & Leave History Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        <div className="form-card" style={{ margin: 0 }}>
          <h3>Leave History</h3>
          {leaveRequests.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No leave applications logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaveRequests.map(req => (
                <div key={req.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{req.policyName}</strong>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: req.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: req.status === 'APPROVED' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Range: {req.startDate} to {req.endDate}
                  </div>
                  {req.reason && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Reason: "{req.reason}"</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-card" style={{ margin: 0 }}>
          <h3>Attendance Registry</h3>
          {attendanceLogs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No check-in logs recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
              {attendanceLogs.map(log => (
                <div key={log.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Present</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP: {log.ipAddress}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    In: {new Date(log.checkIn).toLocaleString()} | Out: {log.checkOut ? new Date(log.checkOut).toLocaleString() : 'Active'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
