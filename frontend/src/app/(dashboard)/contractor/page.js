'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as contractorService from '../../../services/contractorService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ContractorPage() {
  const [activeTab, setActiveTab] = useState('contractors'); // contractors, timesheets
  const [contractors, setContractors] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [agreements, setAgreements] = useState([]);
  const [timesheets, setTimesheets] = useState([]);

  // Form states
  const [newContractor, setNewContractor] = useState({ fullName: '', email: '', vendorCompany: '', hourlyRate: 0, currency: 'USD', startDate: '', endDate: '' });
  const [newAgreement, setNewAgreement] = useState({ contractorId: '', documentName: '', documentUrl: '', startDate: '', endDate: '' });
  const [newTimesheet, setNewTimesheet] = useState({ contractorId: '', weekStartDate: '', hoursLogged: 0, description: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    contractorService.getContractors()
      .then(res => {
        setContractors(res || []);
        if (res && res.length > 0 && !selectedContractorId) {
          setSelectedContractorId(res[0].id);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedContractorId) {
      contractorService.getAgreements(selectedContractorId)
        .then(res => setAgreements(res || []))
        .catch(err => console.error(err));

      contractorService.getTimesheets(selectedContractorId)
        .then(res => setTimesheets(res || []))
        .catch(err => console.error(err));
    }
  }, [selectedContractorId]);

  const handleAddContractor = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newContractor.fullName.trim() || !newContractor.email.trim()) {
      return setError('Full Name and Email are required.');
    }

    startTransition(async () => {
      try {
        await contractorService.addContractor(newContractor);
        setMessage('Contractor added successfully.');
        setNewContractor({ fullName: '', email: '', vendorCompany: '', hourlyRate: 0, currency: 'USD', startDate: '', endDate: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to add contractor.');
      }
    });
  };

  const handleAddAgreement = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newAgreement.documentName.trim() || !newAgreement.startDate) {
      return setError('Document Name and Start Date are required.');
    }
    const payload = { ...newAgreement, contractorId: selectedContractorId };

    startTransition(async () => {
      try {
        await contractorService.addAgreement(payload);
        setMessage('Agreement logged successfully.');
        setNewAgreement({ contractorId: '', documentName: '', documentUrl: '', startDate: '', endDate: '' });
        // Trigger load
        setSelectedContractorId(selectedContractorId);
      } catch (err) {
        setError(err.message || 'Failed to add agreement.');
      }
    });
  };

  const handleSubmitTimesheet = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newTimesheet.weekStartDate || newTimesheet.hoursLogged <= 0) {
      return setError('Week Start Date and Hours Logged are required.');
    }
    const payload = { ...newTimesheet, contractorId: selectedContractorId };

    startTransition(async () => {
      try {
        await contractorService.submitTimesheet(payload);
        setMessage('Contractor timesheet submitted successfully.');
        setNewTimesheet({ contractorId: '', weekStartDate: '', hoursLogged: 0, description: '' });
        // Trigger load
        setSelectedContractorId(selectedContractorId);
      } catch (err) {
        setError(err.message || 'Failed to submit timesheet.');
      }
    });
  };

  const handleActionTimesheet = (timesheetId, approve) => {
    setError('');
    setMessage('');
    const status = approve ? 'APPROVED' : 'REJECTED';

    startTransition(async () => {
      try {
        await contractorService.actionTimesheet(timesheetId, status);
        setMessage(`Timesheet status set to ${status}.`);
        // Trigger load
        setSelectedContractorId(selectedContractorId);
      } catch (err) {
        setError(err.message || 'Failed to update timesheet status.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Contractor Management</h1>
        <p className="page-subtitle">Track third-party agreements, log vendor billing logs, and approve contractor weekly timesheets</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Select Contractor context */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontWeight: 'bold' }}>Active Contractor Focus:</label>
        <select value={selectedContractorId} onChange={e => setSelectedContractorId(e.target.value)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          <option value="">-- Select Contractor --</option>
          {contractors.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.vendorCompany || 'Independent'})</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'contractors' ? 'active' : ''}`} onClick={() => setActiveTab('contractors')} style={{ background: activeTab === 'contractors' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Contractors & Agreements
        </button>
        <button className={`tab-btn ${activeTab === 'timesheets' ? 'active' : ''}`} onClick={() => setActiveTab('timesheets')} style={{ background: activeTab === 'timesheets' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Weekly Timesheets
        </button>
      </div>

      {activeTab === 'contractors' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }}>
            <div className="form-card" style={{ marginBottom: '24px' }}>
              <h3>Contractor Master Roster</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Vendor Company</th>
                    <th style={{ padding: '12px' }}>Billing Rate</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contractors.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', background: c.id === selectedContractorId ? 'rgba(99,102,241,0.05)' : 'none' }}>
                      <td style={{ padding: '12px' }}><strong>{c.fullName}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</span></td>
                      <td style={{ padding: '12px' }}>{c.vendorCompany || 'Independent'}</td>
                      <td style={{ padding: '12px' }}>${c.hourlyRate}/hr ({c.currency})</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', background: c.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: c.status === 'ACTIVE' ? 'var(--accent-success)' : '#ef4444' }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-card">
              <h3>Active Agreements / SOW Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {agreements.map((a, idx) => (
                  <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--accent-primary)' }}>{a.documentName}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {a.status}</span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                      Duration: {a.startDate} to {a.endDate || 'Ongoing'}
                    </div>
                    {a.documentUrl && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                        <a href={a.documentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>View SOW Contract</a>
                      </div>
                    )}
                  </div>
                ))}
                {agreements.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No SOW agreements mapped for this contractor.</p>}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Add New Contractor</h3>
            <form onSubmit={handleAddContractor} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Full Name</label>
                <input type="text" className={styles.input} placeholder="e.g. John Doe" value={newContractor.fullName} onChange={e => setNewContractor({ ...newContractor, fullName: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Email Address</label>
                <input type="email" className={styles.input} placeholder="e.g. john@vendor.com" value={newContractor.email} onChange={e => setNewContractor({ ...newContractor, email: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Vendor Company (Optional)</label>
                <input type="text" className={styles.input} placeholder="e.g. Acme Tech Solutions" value={newContractor.vendorCompany} onChange={e => setNewContractor({ ...newContractor, vendorCompany: e.target.value })} disabled={isPending} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Hourly Rate ($)</label>
                  <input type="number" min="0" className={styles.input} value={newContractor.hourlyRate} onChange={e => setNewContractor({ ...newContractor, hourlyRate: parseFloat(e.target.value) || 0 })} disabled={isPending} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Currency</label>
                  <input type="text" className={styles.input} placeholder="USD" value={newContractor.currency} onChange={e => setNewContractor({ ...newContractor, currency: e.target.value })} disabled={isPending} />
                </div>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Register Contractor</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Timesheet Audit logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {timesheets.map((ts, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--accent-primary)' }}>Week Starting: {ts.weekStartDate}</strong>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', background: ts.status === 'PENDING' ? 'rgba(234,179,8,0.1)' : ts.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: ts.status === 'PENDING' ? '#eab308' : ts.status === 'APPROVED' ? 'var(--accent-success)' : '#ef4444' }}>
                      {ts.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                    Hours Logged: <strong style={{ fontSize: '1rem' }}>{ts.hoursLogged} hours</strong>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Work Summary: {ts.description || 'No description provided'}
                  </div>

                  {ts.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button className={styles.btn} onClick={() => handleActionTimesheet(ts.id, true)} style={{ padding: '6px 12px', background: 'var(--accent-success)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>
                        Approve billing
                      </button>
                      <button className={styles.btn} onClick={() => handleActionTimesheet(ts.id, false)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }} disabled={isPending}>
                        Reject hours
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {timesheets.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No timesheets submitted for this contractor.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Log Weekly Hours</h3>
            <form onSubmit={handleSubmitTimesheet} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Week Start Date (Monday)</label>
                <input type="date" className={styles.input} value={newTimesheet.weekStartDate} onChange={e => setNewTimesheet({ ...newTimesheet, weekStartDate: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Total Hours Logged</label>
                <input type="number" min="0" max="168" className={styles.input} value={newTimesheet.hoursLogged} onChange={e => setNewTimesheet({ ...newTimesheet, hoursLogged: parseFloat(e.target.value) || 0 })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Description of Deliverables</label>
                <textarea className={styles.input} placeholder="Detail modules delivered or issues solved..." value={newTimesheet.description} onChange={e => setNewTimesheet({ ...newTimesheet, description: e.target.value })} disabled={isPending} style={{ minHeight: '80px' }} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Log Timesheet Card</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
