'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as adminService from '../../../services/enterpriseAdminService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function EnterpriseAdminPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    featureFlagsJson: '{"ai_copilot": true, "payroll_engine": true}',
    licenseType: 'ENTERPRISE_UNLIMITED'
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminService.getAdminSettings()
      .then(res => {
        if (res && res.licenseType) setSettings(res);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!settings.licenseType) return setError('License type is required.');

    startTransition(async () => {
      try {
        await adminService.updateAdminSettings(settings);
        setMessage('Enterprise Administration settings updated.');
      } catch (err) {
        setError(err.message || 'Failed to update enterprise admin settings.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Enterprise Administration & Super Admin</h1>
        <p className="page-subtitle">Multi-tenant platform control, feature flags, global maintenance mode, support dashboard, and license governance</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ maxWidth: '650px' }} className="form-card">
        <h3>Platform Master Control</h3>
        <form onSubmit={handleSaveSettings} style={{ marginTop: '16px' }}>
          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} disabled={isPending} />
              Platform Maintenance Mode (Suspend Non-Admin Access)
            </label>
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.label}>Tenant Enterprise License Tier</label>
            <select className={styles.input} value={settings.licenseType} onChange={e => setSettings({ ...settings, licenseType: e.target.value })} disabled={isPending}>
              <option value="ENTERPRISE_UNLIMITED">Enterprise Unlimited (All 60+ Modules Active)</option>
              <option value="GROWTH_TIER">Growth Tier (Core HR & Payroll)</option>
              <option value="TRIAL_14_DAYS">Trial Account (14 Days)</option>
            </select>
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
            <label className={styles.label}>Global Feature Flags (JSON)</label>
            <textarea className={styles.input} rows="4" value={settings.featureFlagsJson} onChange={e => setSettings({ ...settings, featureFlagsJson: e.target.value })} disabled={isPending}></textarea>
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Platform Configurations</button>
        </form>
      </div>
    </div>
  );
}
