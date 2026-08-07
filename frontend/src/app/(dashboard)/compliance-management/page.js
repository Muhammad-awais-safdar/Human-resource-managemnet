'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as complianceService from '../../../services/complianceManagementService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ComplianceManagementPage() {
  const [activeTab, setActiveTab] = useState('checklists'); // checklists, risks, policies
  const [checklists, setChecklists] = useState([]);
  const [risks, setRisks] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [newChecklist, setNewChecklist] = useState({ title: '', countryCode: 'GLOBAL', category: 'LABOR_LAW', requirementDetails: '' });
  const [newRisk, setNewRisk] = useState({ topic: '', impactLevel: 'MEDIUM', likelihoodLevel: 'LOW', mitigationPlan: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    complianceService.getChecklists()
      .then(res => setChecklists(res || []))
      .catch(err => console.error(err));

    complianceService.getRiskAssessments()
      .then(res => setRisks(res || []))
      .catch(err => console.error(err));

    complianceService.getPolicyAcknowledgements()
      .then(res => setPolicies(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateChecklist = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newChecklist.title) return setError('Title is required.');

    startTransition(async () => {
      try {
        await complianceService.createChecklist(newChecklist);
        setMessage('Compliance requirement created.');
        setNewChecklist({ title: '', countryCode: 'GLOBAL', category: 'LABOR_LAW', requirementDetails: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create checklist item.');
      }
    });
  };

  const handleCreateRisk = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newRisk.topic) return setError('Topic is required.');

    startTransition(async () => {
      try {
        await complianceService.createRiskAssessment(newRisk);
        setMessage('Risk assessment recorded.');
        setNewRisk({ topic: '', impactLevel: 'MEDIUM', likelihoodLevel: 'LOW', mitigationPlan: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create risk item.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Compliance & Audits</h1>
        <p className="page-subtitle">Country labor law checklists, internal risk audits, and digital policy sign-offs</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'checklists' ? 'active' : ''}`} onClick={() => setActiveTab('checklists')} style={{ background: activeTab === 'checklists' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Labor Compliance Checklists
        </button>
        <button className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`} onClick={() => setActiveTab('risks')} style={{ background: activeTab === 'risks' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Risk Assessment Board
        </button>
        <button className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`} onClick={() => setActiveTab('policies')} style={{ background: activeTab === 'policies' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Policy Acknowledgements
        </button>
      </div>

      {activeTab === 'checklists' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Compliance Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {checklists.map((c, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{c.title} [{c.country_code || c.countryCode}]</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{c.requirement_details || c.requirementDetails || 'Standard labor compliance mandate'}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{c.status}</span>
                </div>
              ))}
              {checklists.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No compliance items recorded.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Add Requirement</h3>
            <form onSubmit={handleCreateChecklist} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Title</label>
                <input type="text" className={styles.input} placeholder="Statutory Minimum Wage Standard" value={newChecklist.title} onChange={e => setNewChecklist({ ...newChecklist, title: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Country Code</label>
                <input type="text" className={styles.input} placeholder="US, UK, DE, PK, GLOBAL" value={newChecklist.countryCode} onChange={e => setNewChecklist({ ...newChecklist, countryCode: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Requirement Details</label>
                <textarea className={styles.input} rows="3" placeholder="Verify annual wage reviews comply with statutory requirements" value={newChecklist.requirementDetails} onChange={e => setNewChecklist({ ...newChecklist, requirementDetails: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Requirement</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Risk Assessment Audit Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {risks.map((r, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{r.topic}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Impact: {r.impact_level || r.impactLevel} | Likelihood: {r.likelihood_level || r.likelihoodLevel}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-warning)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{r.status}</span>
                </div>
              ))}
              {risks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No risks recorded.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Record Risk Item</h3>
            <form onSubmit={handleCreateRisk} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Risk Topic</label>
                <input type="text" className={styles.input} placeholder="GDPR Data Retention Expiry" value={newRisk.topic} onChange={e => setNewRisk({ ...newRisk, topic: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Mitigation Plan</label>
                <textarea className={styles.input} rows="3" placeholder="Implement automated database purging scripts after 7 years" value={newRisk.mitigationPlan} onChange={e => setNewRisk({ ...newRisk, mitigationPlan: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Record Risk</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="form-card">
          <h3>Employee Policy Acknowledgements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {policies.map((p, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{p.policy_name || p.policyName} (v{p.policy_version || p.policyVersion})</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Acknowledged at: {new Date(p.acknowledged_at || p.acknowledgedAt || '2026-08-04T00:00:00Z').toLocaleString()}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Signed & Verified</span>
              </div>
            ))}
            {policies.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No policy acknowledgements recorded.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
