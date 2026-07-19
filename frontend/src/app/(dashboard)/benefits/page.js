'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as benefitsService from '../../../services/benefitsService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function BenefitsPage() {
  const [activeTab, setActiveTab] = useState('plans'); // plans, enrollments
  const [plans, setPlans] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);

  // Form states
  const [newPlan, setNewPlan] = useState({ name: '', category: 'HEALTH', description: '', monthlyCost: 0, employerShare: 100 });
  const [isSuperAdmin, setIsSuperAdmin] = useState(true); // Toggle to show admin view options

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    benefitsService.getPlans()
      .then(res => setPlans(res || []))
      .catch(err => console.error(err));

    benefitsService.getMyEnrollments()
      .then(res => setMyEnrollments(res || []))
      .catch(err => console.error(err));

    benefitsService.getAllEnrollments()
      .then(res => setAllEnrollments(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPlan.name.trim() || !newPlan.category) return setError('Name and Category are required.');

    startTransition(async () => {
      try {
        await benefitsService.addPlan(newPlan);
        setMessage('Benefit plan published successfully.');
        setNewPlan({ name: '', category: 'HEALTH', description: '', monthlyCost: 0, employerShare: 100 });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to publish plan.');
      }
    });
  };

  const handleEnroll = (planId) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await benefitsService.enroll(planId);
        setMessage('Successfully registered for the benefit program.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to enroll in benefit plan.');
      }
    });
  };

  const handleUnenroll = (planId) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await benefitsService.unenroll(planId);
        setMessage('Unenrollment request processed successfully.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to unenroll.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Benefits Administration</h1>
        <p className="page-subtitle">Configure company-wide health, retirement, allowance packages, and track active enrollments</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')} style={{ background: activeTab === 'plans' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Benefit Plans Catalog
        </button>
        <button className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`} onClick={() => setActiveTab('enrollments')} style={{ background: activeTab === 'enrollments' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Active Enrollments Roster
        </button>
      </div>

      {activeTab === 'plans' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Available Benefit Programs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {plans.map((p, idx) => {
                const isEnrolled = myEnrollments.some(e => e.planName === p.name && e.status === 'ACTIVE');
                return (
                  <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#eab308', background: 'rgba(234,179,8,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{p.category}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{p.description || 'No description provided'}</p>
                      <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Monthly Cost: ${p.monthlyCost} | Employer Share: {p.employerShare}%
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                      {isEnrolled ? (
                        <button onClick={() => handleUnenroll(p.id)} className={styles.btn} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }} disabled={isPending}>
                          Unenroll
                        </button>
                      ) : (
                        <button onClick={() => handleEnroll(p.id)} className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '6px 12px', cursor: 'pointer', width: '100%' }} disabled={isPending}>
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {plans.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No plans created.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Publish New Program</h3>
            <form onSubmit={handleCreatePlan} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Plan Name</label>
                <input type="text" className={styles.input} placeholder="e.g. Standard Dental Plan" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Category</label>
                <select className={styles.input} style={{ background: 'var(--bg-tertiary)' }} value={newPlan.category} onChange={e => setNewPlan({ ...newPlan, category: e.target.value })} disabled={isPending}>
                  <option value="HEALTH">Health & Wellness</option>
                  <option value="LIFE">Life Insurance</option>
                  <option value="RETIREMENT">Retirement Plan</option>
                  <option value="ALLOWANCE">Transport Allowance</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Monthly Program Cost ($)</label>
                <input type="number" min="0" className={styles.input} value={newPlan.monthlyCost} onChange={e => setNewPlan({ ...newPlan, monthlyCost: parseFloat(e.target.value) || 0 })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Employer Share (%)</label>
                <input type="number" min="0" max="100" className={styles.input} value={newPlan.employerShare} onChange={e => setNewPlan({ ...newPlan, employerShare: parseFloat(e.target.value) || 0 })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Detailed Description</label>
                <textarea className={styles.input} placeholder="Specify plan details..." value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })} disabled={isPending} style={{ minHeight: '80px' }} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Publish Benefit Program</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="form-card">
          <h3>Registered Employee Enrollments</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Employee</th>
                <th style={{ padding: '12px' }}>Plan Name</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Cost</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allEnrollments.map((enr, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px' }}><strong>{enr.firstName} {enr.lastName}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{enr.email}</span></td>
                  <td style={{ padding: '12px' }}>{enr.planName}</td>
                  <td style={{ padding: '12px' }}>{enr.category}</td>
                  <td style={{ padding: '12px' }}>${enr.monthlyCost}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', background: enr.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: enr.status === 'ACTIVE' ? 'var(--accent-success)' : '#ef4444' }}>
                      {enr.status}
                    </span>
                  </td>
                </tr>
              ))}
              {allEnrollments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No enrollments recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
