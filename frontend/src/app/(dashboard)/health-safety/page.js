'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as healthSafetyService from '../../../services/healthSafetyService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function HealthSafetyPage() {
  const [activeTab, setActiveTab] = useState('incidents'); // incidents, ppe
  const [incidents, setIncidents] = useState([]);
  const [ppeList, setPpeList] = useState([]);

  const [newIncident, setNewIncident] = useState({ title: '', severity: 'MEDIUM', location: '', description: '' });
  const [newPpe, setNewPpe] = useState({ itemName: '', employeeId: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    healthSafetyService.getIncidents()
      .then(res => setIncidents(res || []))
      .catch(err => console.error(err));

    healthSafetyService.getPpeAssignments()
      .then(res => setPpeList(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportIncident = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newIncident.title) return setError('Title is required.');

    startTransition(async () => {
      try {
        await healthSafetyService.reportIncident(newIncident);
        setMessage('Safety incident reported.');
        setNewIncident({ title: '', severity: 'MEDIUM', location: '', description: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to report incident.');
      }
    });
  };

  const handleAssignPpe = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPpe.itemName || !newPpe.employeeId) return setError('Item Name and Employee ID are required.');

    startTransition(async () => {
      try {
        await healthSafetyService.assignPpe(newPpe);
        setMessage('PPE gear assigned.');
        setNewPpe({ itemName: '', employeeId: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to assign PPE gear.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Health & Safety Management</h1>
        <p className="page-subtitle">Report workplace safety incidents, track hazard investigations, and manage PPE gear assignments</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')} style={{ background: activeTab === 'incidents' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Safety Incident Reports
        </button>
        <button className={`tab-btn ${activeTab === 'ppe' ? 'active' : ''}`} onClick={() => setActiveTab('ppe')} style={{ background: activeTab === 'ppe' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          PPE Gear Assignments
        </button>
      </div>

      {activeTab === 'incidents' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Incident Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {incidents.map((inc, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{inc.title}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Location: {inc.location || 'Facility Floor'} | Severity: {inc.severity}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-warning)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{inc.status}</span>
                </div>
              ))}
              {incidents.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No safety incidents logged.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Report Safety Incident</h3>
            <form onSubmit={handleReportIncident} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Title</label>
                <input type="text" className={styles.input} placeholder="Slippery Floor Near Warehouse Exit" value={newIncident.title} onChange={e => setNewIncident({ ...newIncident, title: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Severity Level</label>
                <select className={styles.input} value={newIncident.severity} onChange={e => setNewIncident({ ...newIncident, severity: e.target.value })} disabled={isPending}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Facility Location</label>
                <input type="text" className={styles.input} placeholder="Building A - Floor 2" value={newIncident.location} onChange={e => setNewIncident({ ...newIncident, location: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.input} rows="3" placeholder="Oil spill detected during morning shift inspection" value={newIncident.description} onChange={e => setNewIncident({ ...newIncident, description: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Report Incident</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'ppe' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Assigned PPE Gear Registry</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {ppeList.map((p, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{p.item_name || p.itemName}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Employee ID: {p.employee_id || p.employeeId} | Assigned: {p.assigned_date || 'Today'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{p.status || 'ACTIVE'}</span>
                </div>
              ))}
              {ppeList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No PPE gear assignments logged.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Assign PPE Gear</h3>
            <form onSubmit={handleAssignPpe} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>PPE Item Name</label>
                <input type="text" className={styles.input} placeholder="High-Visibility Vest & Safety Helmet" value={newPpe.itemName} onChange={e => setNewPpe({ ...newPpe, itemName: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Employee ID Reference</label>
                <input type="text" className={styles.input} placeholder="emp-uuid-123" value={newPpe.employeeId} onChange={e => setNewPpe({ ...newPpe, employeeId: e.target.value })} disabled={isPending} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Assign Gear</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
