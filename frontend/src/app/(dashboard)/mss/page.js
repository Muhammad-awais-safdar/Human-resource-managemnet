'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as leaveService from '../../../services/leaveService';
import * as attendanceService from '../../../services/attendanceService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function MSSPage() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    // Get all leave requests
    leaveService.getRequests()
      .then(res => {
        setPendingRequests(res.filter(r => r.status === 'PENDING'));
      })
      .catch(err => console.error(err));

    // Get all attendance logs
    attendanceService.getAttendanceHistory()
      .then(res => setTeamAttendance(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = (requestId, status) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await leaveService.updateRequestStatus(requestId, { status });
        if (res.success) {
          setMessage(`Leave request successfully ${status.toLowerCase()}!`);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to update request.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Manager Approvals Portal (MSS)</h1>
        <p className="page-subtitle">Verify team attendance entries and authorize vacation allocations</p>
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

      {/* Leave Approvals Queue Card */}
      <div className="form-card" style={{ maxWidth: '100%', marginBottom: '32px' }}>
        <h3>Pending Approvals Queue</h3>
        {pendingRequests.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '16px 0' }}>
            No pending time-off requests require your approval.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingRequests.map(req => (
              <div 
                key={req.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{req.firstName} {req.lastName}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px' }}>({req.email})</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '6px' }}>
                    {req.policyName} Application
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Dates: {req.startDate} to {req.endDate}
                  </div>
                  {req.reason && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      Reason: &quot;{req.reason}&quot;
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleAction(req.id, 'APPROVED')} 
                    className={`${styles.btn} ${styles.btnPrimary}`} 
                    style={{ width: 'auto', padding: '0 20px', height: '36px' }}
                    disabled={isPending}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'REJECTED')} 
                    className={styles.btn} 
                    style={{ width: 'auto', padding: '0 20px', height: '36px', background: 'var(--accent-danger)', border: 'none', color: '#fff' }}
                    disabled={isPending}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subordinates Attendance Logs list */}
      <div className="form-card" style={{ maxWidth: '100%' }}>
        <h3>Team Attendance Logs</h3>
        {teamAttendance.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '16px 0' }}>
            No attendance history recorded for team members.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Employee</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Check-In</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Check-Out</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Client IP</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Geofence Coords</th>
                </tr>
              </thead>
              <tbody>
                {teamAttendance.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600' }}>{log.firstName} {log.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.email}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(log.checkIn).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {log.checkOut ? new Date(log.checkOut).toLocaleString() : (
                        <span style={{ color: 'var(--accent-success)', fontWeight: '600' }}>Active session</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.ipAddress}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {log.latitude && log.longitude ? (
                        <code style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                        </code>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Mismatched</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
