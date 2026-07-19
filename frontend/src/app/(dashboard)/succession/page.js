'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as successionService from '../../../services/successionService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function SuccessionPage() {
  const [activeTab, setActiveTab] = useState('plans'); // plans, positions, pools
  const [plans, setPlans] = useState([]);
  const [positions, setPositions] = useState([]);
  const [pools, setPools] = useState([]);

  // Form states
  const [newPosition, setNewPosition] = useState({ title: '', isCritical: false, departmentId: '' });
  const [newPlan, setNewPlan] = useState({ positionId: '', successorId: '', readinessScore: 50, timelineMonths: 12, notes: '' });
  const [newPool, setNewPool] = useState({ name: '', description: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    successionService.getSuccessionPlans()
      .then(res => setPlans(res || []))
      .catch(err => console.error(err));

    successionService.getPositions()
      .then(res => setPositions(res || []))
      .catch(err => console.error(err));

    successionService.getTalentPools()
      .then(res => setPools(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPosition = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPosition.title.trim()) return setError('Position title is required.');

    startTransition(async () => {
      try {
        await successionService.addPosition(newPosition);
        setMessage('Critical position added successfully.');
        setNewPosition({ title: '', isCritical: false, departmentId: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to add position.');
      }
    });
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPlan.positionId || !newPlan.successorId) {
      return setError('Position and successor ID are required.');
    }

    startTransition(async () => {
      try {
        await successionService.addSuccessorToPlan(newPlan);
        setMessage('Successor mapped to position successfully.');
        setNewPlan({ positionId: '', successorId: '', readinessScore: 50, timelineMonths: 12, notes: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to map successor.');
      }
    });
  };

  const handleAddPool = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPool.name.trim()) return setError('Talent pool name is required.');

    startTransition(async () => {
      try {
        await successionService.addTalentPool(newPool);
        setMessage('Talent pool created successfully.');
        setNewPool({ name: '', description: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create talent pool.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Succession Planning</h1>
        <p className="page-subtitle">Map successor pipelines, identify critical roles, and manage high-potential talent pools</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')} style={{ background: activeTab === 'plans' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Succession Map
        </button>
        <button className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`} onClick={() => setActiveTab('positions')} style={{ background: activeTab === 'positions' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Critical Roles
        </button>
        <button className={`tab-btn ${activeTab === 'pools' ? 'active' : ''}`} onClick={() => setActiveTab('pools')} style={{ background: activeTab === 'pools' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Talent Pools
        </button>
      </div>

      {activeTab === 'plans' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Active Succession Pipelines</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {plans.map((p, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--accent-primary)' }}>{p.positionTitle}</strong>
                    {p.isCritical && <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>CRITICAL ROLE</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem' }}>
                    <span>Successor: {p.firstName} {p.lastName} ({p.email})</span>
                    <span>Readiness: <strong style={{ color: p.readinessScore >= 80 ? 'var(--accent-success)' : '#eab308' }}>{p.readinessScore}%</strong></span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Timeline: {p.timelineMonths} months | Notes: {p.notes || 'None'}
                  </div>
                </div>
              ))}
              {plans.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No succession plans registered.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Map New Successor</h3>
            <form onSubmit={handleAddPlan} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Select Role / Position</label>
                <select className={styles.input} style={{ background: 'var(--bg-tertiary)' }} value={newPlan.positionId} onChange={e => setNewPlan({ ...newPlan, positionId: e.target.value })} disabled={isPending}>
                  <option value="">-- Choose Position --</option>
                  {positions.map(pos => <option key={pos.id} value={pos.id}>{pos.title}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Successor Employee ID</label>
                <input type="text" className={styles.input} placeholder="e.g. employee-uuid" value={newPlan.successorId} onChange={e => setNewPlan({ ...newPlan, successorId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Readiness Score (%)</label>
                <input type="number" min="0" max="100" className={styles.input} value={newPlan.readinessScore} onChange={e => setNewPlan({ ...newPlan, readinessScore: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Timeline (Months)</label>
                <input type="number" min="1" className={styles.input} value={newPlan.timelineMonths} onChange={e => setNewPlan({ ...newPlan, timelineMonths: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Evaluation Notes</label>
                <textarea className={styles.input} placeholder="Detail notes about training needs..." value={newPlan.notes} onChange={e => setNewPlan({ ...newPlan, notes: e.target.value })} disabled={isPending} style={{ minHeight: '80px' }} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Map Pipeline Slot</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'positions' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Registered Positions & Criticality</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Criticality</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}><strong>{pos.title}</strong></td>
                    <td style={{ padding: '12px' }}>{pos.departmentName || 'All Companies'}</td>
                    <td style={{ padding: '12px' }}>
                      {pos.isCritical ? (
                        <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>CRITICAL</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Register Position</h3>
            <form onSubmit={handleAddPosition} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Position Title</label>
                <input type="text" className={styles.input} placeholder="e.g. Chief Technical Officer" value={newPosition.title} onChange={e => setNewPosition({ ...newPosition, title: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Department ID (Optional)</label>
                <input type="text" className={styles.input} placeholder="e.g. dept-uuid" value={newPosition.departmentId} onChange={e => setNewPosition({ ...newPosition, departmentId: e.target.value })} disabled={isPending} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="isCritical" checked={newPosition.isCritical} onChange={e => setNewPosition({ ...newPosition, isCritical: e.target.checked })} disabled={isPending} />
                <label htmlFor="isCritical" style={{ cursor: 'pointer' }}>Mark role as Critical</label>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Create Position Config</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'pools' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Talent Pool Management</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {pools.map((p, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <strong>{p.name}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{p.description || 'No description provided'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{p.memberCount} Members enrolled</span>
                    <span style={{ color: 'var(--text-muted)' }}>Created at: {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {pools.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No talent pools defined.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Create Talent Pool</h3>
            <form onSubmit={handleAddPool} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Pool Name</label>
                <input type="text" className={styles.input} placeholder="e.g. Leadership Track 2026" value={newPool.name} onChange={e => setNewPool({ ...newPool, name: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.input} placeholder="Describe the talent pool target segment..." value={newPool.description} onChange={e => setNewPool({ ...newPool, description: e.target.value })} disabled={isPending} style={{ minHeight: '80px' }} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Publish Talent Pool</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
