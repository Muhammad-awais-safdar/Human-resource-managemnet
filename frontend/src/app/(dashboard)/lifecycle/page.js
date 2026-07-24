'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import * as employeeService from '../../../services/employeeService';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

export default function LifecycleDashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [roles, setRoles] = useState([]);

  // Log Milestone Form states
  const [selectedEmp, setSelectedEmp] = useState('');
  const [eventType, setEventType] = useState('PROMOTION');
  const [eventDesc, setEventDesc] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  // Exit Clearance state
  const [clearanceEmp, setClearanceEmp] = useState('');

  // Register Employee Form states
  const [regCode, setRegCode] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRoleId, setRegRoleId] = useState('');
  const [invitedToken, setInvitedToken] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    employeeService.listEmployees()
      .then(res => {
        setEmployees(res);
        if (res.length > 0) {
          setSelectedEmp(res[0].id);
          setClearanceEmp(res[0].id);
        }
      })
      .catch(err => console.error(err));

    employeeService.getTimeline()
      .then(res => setTimeline(res))
      .catch(err => console.error(err));

    employeeService.getExitClearances()
      .then(res => setClearances(res))
      .catch(err => console.error(err));

    apiClient.get('/roles')
      .then(res => {
        if (res.success) {
          setRoles(res.roles);
          if (res.roles.length > 0) {
            setRegRoleId(res.roles[0].id);
          }
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteEmployee = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setInvitedToken('');

    if (!regCode || !regFirstName || !regLastName || !regEmail) {
      return setError('Please fill in all employee invitation fields.');
    }

    startTransition(async () => {
      try {
        const res = await employeeService.inviteEmployee({
          employeeCode: regCode,
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          roleId: regRoleId,
        });

        if (res.success) {
          setMessage('Employee invite generated successfully! Share the activation token.');
          setInvitedToken(res.token);
          setRegCode('');
          setRegFirstName('');
          setRegLastName('');
          setRegEmail('');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to generate employee invitation.');
      }
    });
  };


  const handleRoleChange = (employeeId, roleId) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await employeeService.updateEmployeeRole(employeeId, roleId);
        if (res.success) {
          setMessage('Employee role updated successfully.');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to update employee role.');
      }
    });
  };

  const handleLogTimeline = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedEmp || !eventDesc || !effectiveDate) {
      return setError('Please fill in all lifecycle event fields.');
    }

    startTransition(async () => {
      try {
        const res = await employeeService.addTimelineEvent({
          employeeId: selectedEmp,
          type: eventType,
          description: eventDesc,
          effectiveDate,
        });

        if (res.success) {
          setMessage('Employee milestone logged successfully.');
          setEventDesc('');
          setEffectiveDate('');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to log event.');
      }
    });
  };

  const handleStartClearance = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!clearanceEmp) return;

    startTransition(async () => {
      try {
        const res = await employeeService.initiateClearance(clearanceEmp);
        if (res.success) {
          setMessage('Exit clearance checklist initiated.');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to start clearance.');
      }
    });
  };

  const handleApproveClearance = (clearanceId, department) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await employeeService.approveClearance(clearanceId, department);
        if (res.success) {
          setMessage(`${department} clearance approved successfully.`);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to approve clearance.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Employee Lifecycle & Onboarding</h1>
        <p className="page-subtitle">Register new hires, dynamic role permissions setup, log promotion events, and offboard employees</p>
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
        
        {/* Invite Employee Form */}
        <form onSubmit={handleInviteEmployee} className="form-card" style={{ flex: '1 1 300px', minWidth: 0, margin: 0 }} noValidate>
          <h3>Invite New Employee</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
            Enter details to generate a secure activation token. The invitee can establish their password using this token.
          </p>
          
          <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.label}>Employee Code</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. EMP-009" 
              value={regCode} 
              onChange={(e) => setRegCode(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div className={styles.formGroup} style={{ flex: '1 1 140px', minWidth: 0 }}>
              <label className={styles.label}>First Name</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="John" 
                value={regFirstName} 
                onChange={(e) => setRegFirstName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: '1 1 140px', minWidth: 0 }}>
              <label className={styles.label}>Last Name</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Doe" 
                value={regLastName} 
                onChange={(e) => setRegLastName(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.label}>Work Email</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="john.doe@company.com" 
              value={regEmail} 
              onChange={(e) => setRegEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label}>Assign Access Role</label>
            <select 
              className={styles.input}
              value={regRoleId}
              onChange={(e) => setRegRoleId(e.target.value)}
              style={{ background: 'var(--bg-tertiary)', width: '100%' }}
              disabled={isPending}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {invitedToken && (
            <div className="form-card" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed var(--accent-primary)', marginBottom: '16px', padding: '12px' }}>
              <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>
                Secure Activation Token
              </strong>
              <code style={{ fontSize: '0.9rem', color: '#fff', wordBreak: 'break-all', display: 'block', background: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: '4px' }}>
                {invitedToken}
              </code>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                Expires in 48 hours. Share this token with the employee to complete account setup.
              </span>
            </div>
          )}

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
            Generate Invitation Link
          </button>
        </form>


        {/* Log Milestone Form */}
        <form onSubmit={handleLogTimeline} className="form-card" style={{ flex: '1 1 300px', minWidth: 0, margin: 0 }} noValidate>
          <h3>Log Lifecycle Event</h3>
          
          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label}>Select Employee</label>
            <select 
              className={styles.input}
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              style={{ background: 'var(--bg-tertiary)', width: '100%' }}
              disabled={isPending}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label}>Milestone Event Type</label>
            <select 
              className={styles.input}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{ background: 'var(--bg-tertiary)', width: '100%' }}
              disabled={isPending}
            >
              <option value="PROMOTION">Promotion</option>
              <option value="TRANSFER">Department Transfer</option>
              <option value="CONFIRMATION">Contract Confirmation</option>
            </select>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label}>Milestone Description</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. Promoted to Tech Lead with 15% raise" 
              value={eventDesc} 
              onChange={(e) => setEventDesc(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
            <label className={styles.label}>Effective Date</label>
            <input 
              type="date" 
              className={styles.input} 
              value={effectiveDate} 
              onChange={(e) => setEffectiveDate(e.target.value)}
              disabled={isPending}
            />
          </div>

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
            Log Milestone
          </button>
        </form>

        {/* Initiate Clearance Form */}
        <form onSubmit={handleStartClearance} className="form-card" style={{ flex: '1 1 300px', minWidth: 0, margin: 0 }} noValidate>
          <h3>Initiate Exit Clearance</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
            Trigger IT, Finance, and HR clearance checksheets for resigning employee departures.
          </p>

          <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.label}>Select Departing Employee</label>
            <select 
              className={styles.input}
              value={clearanceEmp}
              onChange={(e) => setClearanceEmp(e.target.value)}
              style={{ background: 'var(--bg-tertiary)', width: '100%' }}
              disabled={isPending}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
              ))}
            </select>
          </div>

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
            Initiate Checksheets
          </button>
        </form>
      </div>

      {/* Employee Directory & Role Access Table */}
      <div className="form-card" style={{ maxWidth: '100%', marginBottom: '32px' }}>
        <h3>Employee Directory & Role Access Management</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          View registered staff credentials and dynamically alter corporate roles/clearances mappings.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Employee Code</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Assigned Access Role</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'var(--accent-primary)' }}>{emp.employeeCode}</td>
                  <td style={{ padding: '12px', color: '#fff', fontWeight: '550' }}>{emp.firstName} {emp.lastName}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{emp.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', fontWeight: '700' }}>
                      {emp.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      className={styles.input}
                      value={emp.roleId || ''}
                      onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                      style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', height: '32px', fontSize: '0.85rem', width: 'auto', minWidth: '150px', marginRight: '8px' }}
                      disabled={isPending}
                    >
                      <option value="">No Role Assigned</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Link 
                      href={`/employees/${emp.id}`}
                      style={{ 
                        display: 'inline-block', 
                        fontSize: '0.8rem', 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        background: 'rgba(99, 102, 241, 0.15)', 
                        color: 'var(--accent-primary)', 
                        border: '1px solid rgba(99, 102, 241, 0.3)', 
                        textDecoration: 'none', 
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      View 360 Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exit Clearance Approvals List */}
      <div className="form-card" style={{ maxWidth: '100%', marginBottom: '32px' }}>
        <h3>Exit Clearances Audit</h3>
        {clearances.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '12px 0' }}>
            No active exit clearance checksheets logged.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Resigning Employee</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Department Approval</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>IT Approval</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Finance Approval</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Overall Status</th>
                </tr>
              </thead>
              <tbody>
                {clearances.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{c.firstName} {c.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {c.departmentApproved ? (
                        <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem' }}>✓ Approved</span>
                      ) : (
                        <button 
                          onClick={() => handleApproveClearance(c.id, 'DEPARTMENT')} 
                          style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                          disabled={isPending}
                        >
                          Sign Department
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {c.itApproved ? (
                        <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem' }}>✓ Approved</span>
                      ) : (
                        <button 
                          onClick={() => handleApproveClearance(c.id, 'IT')} 
                          style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                          disabled={isPending}
                        >
                          Sign IT
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {c.financeApproved ? (
                        <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem' }}>✓ Approved</span>
                      ) : (
                        <button 
                          onClick={() => handleApproveClearance(c.id, 'FINANCE')} 
                          style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                          disabled={isPending}
                        >
                          Sign Finance
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: c.status === 'CLEARED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: c.status === 'CLEARED' ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: '700' }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timeline Milestones Log */}
      <div className="form-card" style={{ maxWidth: '100%' }}>
        <h3>Milestone Event logs</h3>
        {timeline.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '12px 0' }}>
            No employee milestones logged.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {timeline.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '12px' 
                }}
              >
                <div>
                  <strong style={{ color: '#fff' }}>{item.firstName} {item.lastName}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', marginLeft: '12px', fontWeight: '700' }}>
                    {item.type}
                  </span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.description}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Effective: {item.effectiveDate}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

