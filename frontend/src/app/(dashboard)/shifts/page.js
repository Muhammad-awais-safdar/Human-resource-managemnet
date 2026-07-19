'use client';

import React, { useEffect, useState, useTransition } from 'react';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  
  // Assign Shift States
  const [empId, setEmpId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [assignDate, setAssignDate] = useState('');

  // Swap Shift States
  const [emp1, setEmp1] = useState('');
  const [emp2, setEmp2] = useState('');
  const [swapDate, setSwapDate] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    fetch('http://localhost:3000/api/v1/suite/shifts/schedule')
      .then(res => res.json())
      .then(data => {
        if (data.status === 200 || data.data) {
          setShifts(data.data || []);
        }
      })
      .catch(err => console.error("Failed to load shifts", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignShift = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!empId || !shiftId || !assignDate) {
      return setError('All fields are required to assign a shift.');
    }

    startTransition(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/suite/shifts/assign?employeeId=${empId}&shiftId=${shiftId}&date=${assignDate}`, {
          method: 'POST',
        });
        const data = await response.json();
        if (data.status === 200 || data.success) {
          setMessage('Shift successfully registered on the roster.');
          loadData();
        } else {
          setError(data.message || 'Scheduling conflict detected.');
        }
      } catch (err) {
        setError('Network failure. Please try again.');
      }
    });
  };

  const handleSwapShifts = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!emp1 || !emp2 || !swapDate) {
      return setError('All fields are required to swap roster cards.');
    }

    startTransition(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/suite/shifts/swap?firstEmployeeId=${emp1}&secondEmployeeId=${emp2}&date=${swapDate}`, {
          method: 'POST',
        });
        const data = await response.json();
        if (data.status === 200 || data.success) {
          setMessage('Shifts successfully swapped between employee calendars.');
          loadData();
        } else {
          setError(data.message || 'Failed to complete swap roster.');
        }
      } catch (err) {
        setError('Network failure. Please try again.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Shift Schedule Roster</h1>
        <p className="page-subtitle">Manage weekly working hours rosters and process conflict-free shift swaps</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        
        {/* Assign Shift Form */}
        <div className="form-card" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
          <h3>Assign Calendar Shift</h3>
          <form onSubmit={handleAssignShift} noValidate style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Employee ID Reference</label>
              <input type="text" className={styles.input} placeholder="e.g. employee-uuid" value={empId} onChange={e => setEmpId(e.target.value)} disabled={isPending} />
            </div>
            
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Select Shift Schedule Template</label>
              <select className={styles.input} value={shiftId} onChange={e => setShiftId(e.target.value)} disabled={isPending} style={{ background: 'var(--bg-tertiary)' }}>
                <option value="">-- Choose Shift --</option>
                <option value="1">Day Shift (09:00 - 17:00)</option>
                <option value="2">Night Shift (21:00 - 05:00)</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Roster Date</label>
              <input type="date" className={styles.input} value={assignDate} onChange={e => setAssignDate(e.target.value)} disabled={isPending} />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Assign Active Shift</button>
          </form>
        </div>

        {/* Swap Shift Form */}
        <div className="form-card" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
          <h3>Request Shift Swap</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Swap active roster cards for two employees on the same day.</p>
          <form onSubmit={handleSwapShifts} noValidate style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>First Employee ID</label>
              <input type="text" className={styles.input} placeholder="e.g. employee-uuid-1" value={emp1} onChange={e => setEmp1(e.target.value)} disabled={isPending} />
            </div>
            
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Second Employee ID</label>
              <input type="text" className={styles.input} placeholder="e.g. employee-uuid-2" value={emp2} onChange={e => setEmp2(e.target.value)} disabled={isPending} />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Target Swap Date</label>
              <input type="date" className={styles.input} value={swapDate} onChange={e => setSwapDate(e.target.value)} disabled={isPending} />
            </div>

            <button type="submit" className={`${styles.btn}`} style={{ border: '1px solid var(--border-light)', background: 'none', color: '#fff', width: '100%' }} disabled={isPending}>Process Swapping Request</button>
          </form>
        </div>

      </div>

      {/* Roster Calendar List */}
      <div className="form-card">
        <h3>Weekly Roster Schedule Calendar</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {shifts.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{s.firstName} {s.lastName}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px', fontFamily: 'monospace' }}>ID: {s.employee_id}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Assign Date: {s.work_date} | Schedule: {s.name} ({s.start_time} - {s.end_time})
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: '700' }}>Active Slot</span>
            </div>
          ))}
          {shifts.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '24px' }}>No active roster shifts mapped for this week.</p>
          )}
        </div>
      </div>

    </div>
  );
}
