'use client';

import React, { useEffect, useState, useTransition } from 'react';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

const BRAND_PRESETS = [
  { name: 'Indigo', primary: '#6366f1', secondary: '#a855f7' },
  { name: 'Emerald', primary: '#10b981', secondary: '#059669' },
  { name: 'Sapphire', primary: '#3b82f6', secondary: '#1d4ed8' },
  { name: 'Amber', primary: '#f59e0b', secondary: '#d97706' },
  { name: 'Crimson', primary: '#f43f5e', secondary: '#be123c' },
];

export default function SettingsPage() {
  const [customDomain, setCustomDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#a855f7');
  
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load current settings
    apiClient.get('/tenants/active')
      .then((res) => {
        if (res.success) {
          setCustomDomain(res.customDomain || '');
          setLogoUrl(res.logoUrl || '');
          setPrimaryColor(res.primaryColor || '#6366f1');
          setSecondaryColor(res.secondaryColor || '#a855f7');
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    startTransition(async () => {
      try {
        const response = await apiClient.put('/tenants/active/settings', {
          customDomain,
          logoUrl,
          primaryColor,
          secondaryColor,
        });

        if (response.success) {
          setMessage('Workspace branding settings updated successfully! Page will now reskin.');
          // Dynamically override variables on document root
          document.documentElement.style.setProperty('--accent-primary', primaryColor);
          document.documentElement.style.setProperty('--accent-secondary', secondaryColor);
        }
      } catch (err) {
        setError(err.message || 'Failed to update settings');
      }
    });
  };

  const handlePresetSelect = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  return (
    <div className="settings-container">
      <header className="page-header">
        <h1 className="page-title">Workspace Settings</h1>
        <p className="page-subtitle">Configure white-label branding variables and custom domain mappings</p>
      </header>

      {message && (
        <div className={`${styles.alert}`} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)' }}>
          {message}
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card" noValidate>
        <h3>White-Label Theme</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Custom CNAME Domain</label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. hr.company.com"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            disabled={isPending}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Points a custom web domain to this isolated tenant database context.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Company Logo URL</label>
          <input
            type="url"
            className={styles.input}
            placeholder="e.g. https://company.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Branding Accent Color</label>
          <div className="color-swatch-container">
            {BRAND_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className={`color-swatch ${primaryColor === preset.primary ? 'color-swatch-active' : ''}`}
                style={{ backgroundColor: preset.primary }}
                onClick={() => handlePresetSelect(preset)}
                disabled={isPending}
                title={preset.name}
              />
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className={styles.label} style={{ fontSize: '0.7rem' }}>Primary Hex</label>
              <input
                type="text"
                className={styles.input}
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className={styles.label} style={{ fontSize: '0.7rem' }}>Secondary Hex</label>
              <input
                type="text"
                className={styles.input}
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '24px' }} disabled={isPending}>
          {isPending ? (
            <div className={styles.spinnerWrapper}>
              <div className={styles.spinner} />
              <span>Saving settings...</span>
            </div>
          ) : (
            'Apply Customization'
          )}
        </button>
      </form>
    </div>
  );
}
