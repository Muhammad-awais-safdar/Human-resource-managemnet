'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as superAdminService from '../../../../services/superAdminService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Modal for viewing tenant users roster
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Manual Audit Log state
  const [tenantName, setTenantName] = useState('');
  const [actionType, setActionType] = useState('PROVISION');
  const [details, setDetails] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    superAdminService.getTenantDeepDive()
      .then(res => setTenants(res || []))
      .catch(err => console.error('Failed to load tenant deep dive:', err));

    superAdminService.getLogs()
      .then(res => setLogs(res || []))
      .catch(err => console.error('Failed to load super admin logs:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (tenantId, newStatus) => {
    setError('');
    setMessage('');
    startTransition(async () => {
      try {
        await superAdminService.updateTenantStatus(tenantId, newStatus);
        setMessage(`Tenant status updated to ${newStatus}.`);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to update tenant status.');
      }
    });
  };

  const handleExtendSubscription = (tenantId) => {
    setError('');
    setMessage('');
    startTransition(async () => {
      try {
        await superAdminService.extendTenantSubscription(tenantId, 30);
        setMessage('Tenant subscription extended by +30 days successfully!');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to extend subscription.');
      }
    });
  };

  const handleOpenRoster = (tenant) => {
    setSelectedTenant(tenant);
    setShowRosterModal(true);
    superAdminService.getTenantUsers(tenant.id)
      .then(users => setTenantUsers(users || []))
      .catch(err => {
        console.error(err);
        setTenantUsers([]);
      });
  };

  const handleLogAction = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!tenantName) return setError('Tenant name is required.');

    startTransition(async () => {
      try {
        await superAdminService.logTenantAction({ tenantName, actionType, details });
        setMessage('Super Admin tenant operation logged successfully.');
        setTenantName('');
        setDetails('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to log tenant action.');
      }
    });
  };

  // Compute Telemetry Metrics
  const activeCount = tenants.filter(t => t.status === 'ACTIVE' || t.subscriptionStatus === 'ACTIVE').length;
  const suspendedCount = tenants.filter(t => t.status === 'SUSPENDED' || t.subscriptionStatus === 'SUSPENDED').length;
  const expiredCount = tenants.filter(t => t.status === 'EXPIRED' || t.daysRemaining === 0).length;

  return (
    <div>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Super Admin Multi-Tenant Control Hub</h1>
        <p className="page-subtitle">Deep-dive subscription telemetry, active schema inspection, tenant suspension & automated renewal control</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Subscription Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="form-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL TENANTS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{tenants.length}</div>
        </div>
        <div className="form-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ACTIVE SUBSCRIPTIONS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-success)', marginTop: '6px' }}>{activeCount}</div>
        </div>
        <div className="form-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SUSPENDED TENANTS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-warning)', marginTop: '6px' }}>{suspendedCount}</div>
        </div>
        <div className="form-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>EXPIRED SUBSCRIPTIONS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444', marginTop: '6px' }}>{expiredCount}</div>
        </div>
      </div>

      {/* Main Tenant Deep Dive Inventory Table */}
      <div className="form-card" style={{ marginBottom: '32px' }}>
        <h3>Full Multi-Tenant Deep-Dive Roster</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Live tenant workspace database metadata and subscription state</p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Organization</th>
                <th style={{ padding: '12px' }}>Subdomain</th>
                <th style={{ padding: '12px' }}>Plan Tier</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Days Remaining</th>
                <th style={{ padding: '12px' }}>Users</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#fff' }}>
                    {t.name}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {t.id}</div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--accent-primary)' }}>{t.subdomain}.localhost</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: '700' }}>
                      {t.planTier || 'ENTERPRISE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      fontWeight: '700',
                      background: t.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: t.status === 'ACTIVE' ? 'var(--accent-success)' : '#ef4444'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: t.daysRemaining < 7 ? '#ef4444' : 'var(--text-secondary)' }}>
                    ⏳ {t.daysRemaining != null ? `${t.daysRemaining} Days` : '30 Days'}
                  </td>
                  <td style={{ padding: '12px', color: '#fff' }}>👥 {t.totalUsers || 1}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleExtendSubscription(t.id)}
                        className={styles.btn}
                        style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-success)', border: '1px solid var(--accent-success)' }}
                        disabled={isPending}
                        title="Extend subscription by +30 days"
                      >
                        ⚡ +30 Days
                      </button>

                      {t.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(t.id, 'SUSPENDED')}
                          className={styles.btn}
                          style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-warning)', border: '1px solid var(--accent-warning)' }}
                          disabled={isPending}
                        >
                          ⏸️ Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(t.id, 'ACTIVE')}
                          className={styles.btn}
                          style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
                          disabled={isPending}
                        >
                          ▶️ Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenRoster(t)}
                        className={styles.btn}
                        style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-light)' }}
                      >
                        🔍 Roster
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No tenant workspaces registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs & Action Logger */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Super Admin Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {logs.map((l, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{l.tenant_name || l.tenantName}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Action: {l.action_type || l.actionType} | Note: {l.details}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>LOGGED</span>
              </div>
            ))}
            {logs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tenant audit logs recorded.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Log Super Admin Note</h3>
          <form onSubmit={handleLogAction} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Tenant Subdomain / Org</label>
              <input type="text" className={styles.input} placeholder="master" value={tenantName} onChange={e => setTenantName(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Action Type</label>
              <select className={styles.input} value={actionType} onChange={e => setActionType(e.target.value)} disabled={isPending}>
                <option value="PROVISION">Provision New Tenant</option>
                <option value="SUSPEND">Suspend Tenant Access</option>
                <option value="REACTIVATE">Reactivate Tenant Access</option>
                <option value="IMPERSONATE">Log Impersonation Event</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Operation Note</label>
              <input type="text" className={styles.input} placeholder="Subscription extended for Q3" value={details} onChange={e => setDetails(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Record Audit Note</button>
          </form>
        </div>
      </div>

      {/* Tenant User Roster Modal */}
      {showRosterModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px'
        }}>
          <div className="form-card" style={{ width: '100%', maxWidth: '600px', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowRosterModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3>👥 User Roster: {selectedTenant?.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Active user accounts provisioned inside target workspace <strong>{selectedTenant?.subdomain}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tenantUsers.map(u => (
                <div key={u.id} style={{ padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{u.first_name || u.email} {u.last_name || ''}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email} {u.job_title ? `• ${u.job_title}` : ''}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', fontWeight: '700' }}>
                    {u.role}
                  </span>
                </div>
              ))}
              {tenantUsers.length === 0 && (
                <p style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>No user accounts returned for this tenant context.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
