'use client';

import React, { useEffect, useState, useTransition } from 'react';
import api from '../../../../services/api';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SuperAdminPricingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    code: 'CUSTOM_PLUS',
    name: 'Custom Plus Enterprise',
    basePriceUsd: 299.00,
    perSeatPriceUsd: 12.00,
    billingCycle: 'MONTHLY',
    maxEmployees: 500,
    maxStorageGb: 100,
    isActive: true
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPlans = () => {
    api.get('/suite/superadmin/plans')
      .then(res => setPlans(res.data || []))
      .catch(err => console.error('Super admin plans error:', err));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSubmitPlan = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await api.post('/suite/superadmin/plans', formData);
        setMessage(`Pricing plan '${formData.code}' created/updated successfully.`);
        loadPlans();
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to update pricing plan.');
      }
    });
  };

  const handleEdit = (p) => {
    setFormData({
      code: p.code || p.CODE,
      name: p.name || p.NAME || '',
      basePriceUsd: p.base_price_usd || p.basePriceUsd || 0,
      perSeatPriceUsd: p.per_seat_price_usd || p.perSeatPriceUsd || 0,
      billingCycle: p.billing_cycle || p.billingCycle || 'MONTHLY',
      maxEmployees: p.max_employees || p.maxEmployees || 100,
      maxStorageGb: p.max_storage_gb || p.maxStorageGb || 50,
      isActive: p.is_active !== undefined ? p.is_active : true
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Super Admin Pricing Plan Control</h1>
        <p className="page-subtitle">Platform-wide subscription tier creation, seat rate adjustments, and plan toggles (Super Admin Restricted)</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {/* Existing Plans Table */}
        <div style={{ flex: 1.4, minWidth: '360px' }} className="form-card">
          <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>Configured Platform Subscription Plans</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Code</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Base $</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Seat $</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{p.code || p.CODE}</td>
                    <td style={{ padding: '10px' }}>{p.name || p.NAME}</td>
                    <td style={{ padding: '10px' }}>${p.base_price_usd || p.basePriceUsd}</td>
                    <td style={{ padding: '10px' }}>${p.per_seat_price_usd || p.perSeatPriceUsd}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: (p.is_active ?? true) ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: (p.is_active ?? true) ? 'var(--accent-success)' : 'var(--accent-danger)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {(p.is_active ?? true) ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => handleEdit(p)} className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Edit</button>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No custom pricing plans configured yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Plan Form */}
        <div style={{ flex: 1, minWidth: '320px' }} className="form-card">
          <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>Configure Plan Tier</h3>
          <form onSubmit={handleSubmitPlan}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Plan Code (UPPERCASE_UNIQUE)</label>
              <input type="text" className={styles.input} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required disabled={isPending} />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Plan Display Name</label>
              <input type="text" className={styles.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required disabled={isPending} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Base Price ($ USD)</label>
                <input type="number" step="0.01" className={styles.input} value={formData.basePriceUsd} onChange={e => setFormData({ ...formData, basePriceUsd: parseFloat(e.target.value) || 0 })} disabled={isPending} />
              </div>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Per Seat ($ USD)</label>
                <input type="number" step="0.01" className={styles.input} value={formData.perSeatPriceUsd} onChange={e => setFormData({ ...formData, perSeatPriceUsd: parseFloat(e.target.value) || 0 })} disabled={isPending} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Max Employees</label>
                <input type="number" className={styles.input} value={formData.maxEmployees} onChange={e => setFormData({ ...formData, maxEmployees: parseInt(e.target.value) || 100 })} disabled={isPending} />
              </div>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Max Storage (GB)</label>
                <input type="number" className={styles.input} value={formData.maxStorageGb} onChange={e => setFormData({ ...formData, maxStorageGb: parseInt(e.target.value) || 50 })} disabled={isPending} />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} disabled={isPending} />
                <span>Active Plan (Visible to Tenants for Purchase)</span>
              </label>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending} style={{ width: '100%' }}>
              {isPending ? 'Saving Plan...' : 'Save & Deploy Plan Tier'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
