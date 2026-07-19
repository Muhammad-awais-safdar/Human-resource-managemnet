'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as workforceService from '../../../services/workforceService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function WorkforcePage() {
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, open-shifts
  const [schedules, setSchedules] = useState([]);
  const [openShifts, setOpenShifts] = useState([]);

  // Form states
  const [newSchedule, setNewSchedule] = useState({ employeeId: '', scheduleDate: '', startTime: '09:00', endTime: '17:00', status: 'SCHEDULED' });
  const [newOpenShift, setNewOpenShift] = useState({ departmentId: '', shiftDate: '', startTime: '09:00', endTime: '17:00', requiredCount: 1, status: 'OPEN' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    workforceService.getSchedules()
      .then(res => setSchedules(res || []))
      .catch(err => console.error(err));

    workforceService.getOpenShifts()
      .then(res => setOpenShifts(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newSchedule.employeeId || !newSchedule.scheduleDate || !newSchedule.startTime || !newSchedule.endTime) {
      return setError('Employee, Date, Start Time, and End Time are required.');
    }

    startTransition(async () => {
      try {
        await workforceService.createSchedule(newSchedule);
        setMessage('Schedule published successfully.');
        setNewSchedule({ employeeId: '', scheduleDate: '', startTime: '09:00', endTime: '17:00', status: 'SCHEDULED' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create schedule.');
      }
    });
  };

  const handleCreateOpenShift = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newOpenShift.shiftDate || !newOpenShift.startTime || !newOpenShift.endTime) {
      return setError('Date, Start Time, and End Time are required for open shift.');
    }

    startTransition(async () => {
      try {
        await workforceService.createOpenShift(newOpenShift);
        setMessage('Open shift posted successfully.');
        setNewOpenShift({ departmentId: '', shiftDate: '', startTime: '09:00', endTime: '17:00', requiredCount: 1, status: 'OPEN' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create open shift.');
      }
    });
  };

  const handleBidOnShift = (openShiftId) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await workforceService.bidOnShift(openShiftId);
        setMessage('Shift bid successfully submitted to scheduling officer.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to bid on shift.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Workforce Scheduling</h1>
        <p className="page-subtitle">Allocate working shifts, bid on open calendars, and verify scheduled hours rosters</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')} style={{ background: activeTab === 'schedule' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          My Calendar Schedule
        </button>
        <button className={`tab-btn ${activeTab === 'open-shifts' ? 'active' : ''}`} onClick={() => setActiveTab('open-shifts')} style={{ background: activeTab === 'open-shifts' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Available Open Shifts
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Weekly Calendar Allocations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {schedules.map((s, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>Date: {s.scheduleDate}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Hours: {s.startTime} - {s.endTime} | Status: {s.status}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Scheduled</span>
                </div>
              ))}
              {schedules.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No schedules found on your calendar for this period.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Publish Calendar Roster</h3>
            <form onSubmit={handleCreateSchedule} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Employee ID</label>
                <input type="text" className={styles.input} placeholder="e.g. employee-uuid" value={newSchedule.employeeId} onChange={e => setNewSchedule({ ...newSchedule, employeeId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Schedule Date</label>
                <input type="date" className={styles.input} value={newSchedule.scheduleDate} onChange={e => setNewSchedule({ ...newSchedule, scheduleDate: e.target.value })} disabled={isPending} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Start Time</label>
                  <input type="time" className={styles.input} value={newSchedule.startTime} onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })} disabled={isPending} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>End Time</label>
                  <input type="time" className={styles.input} value={newSchedule.endTime} onChange={e => setNewSchedule({ ...newSchedule, endTime: e.target.value })} disabled={isPending} />
                </div>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Roster Employee</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'open-shifts' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Open Shifts Board</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {openShifts.map((os, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>Date: {os.shiftDate}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Hours: {os.startTime} - {os.endTime} | Slots: {os.requiredCount} | Status: {os.status}
                    </div>
                  </div>
                  {os.status === 'OPEN' && (
                    <button onClick={() => handleBidOnShift(os.id)} className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }} disabled={isPending}>
                      Bid for Shift
                    </button>
                  )}
                </div>
              ))}
              {openShifts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No open shifts currently posted.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Publish Open Shift</h3>
            <form onSubmit={handleCreateOpenShift} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Department ID Reference</label>
                <input type="text" className={styles.input} placeholder="e.g. dept-uuid" value={newOpenShift.departmentId} onChange={e => setNewOpenShift({ ...newOpenShift, departmentId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Shift Date</label>
                <input type="date" className={styles.input} value={newOpenShift.shiftDate} onChange={e => setNewOpenShift({ ...newOpenShift, shiftDate: e.target.value })} disabled={isPending} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Start Time</label>
                  <input type="time" className={styles.input} value={newOpenShift.startTime} onChange={e => setNewOpenShift({ ...newOpenShift, startTime: e.target.value })} disabled={isPending} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>End Time</label>
                  <input type="time" className={styles.input} value={newOpenShift.endTime} onChange={e => setNewOpenShift({ ...newOpenShift, endTime: e.target.value })} disabled={isPending} />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Required Employee Count</label>
                <input type="number" min="1" className={styles.input} value={newOpenShift.requiredCount} onChange={e => setNewOpenShift({ ...newOpenShift, requiredCount: parseInt(e.target.value) || 1 })} disabled={isPending} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Post Open Shift</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
