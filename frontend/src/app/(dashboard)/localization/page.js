'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as locService from '../../../services/localizationService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function LocalizationPage() {
  const [settings, setSettings] = useState({
    defaultLanguage: 'en-US',
    timeZone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currencyCode: 'USD',
    isRtlSupported: false
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    locService.getLocaleSettings()
      .then(res => {
        if (res && res.defaultLanguage) setSettings(res);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await locService.updateLocaleSettings(settings);
        setMessage('Localization & Globalization preferences updated.');
      } catch (err) {
        setError(err.message || 'Failed to update localization settings.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Localization & Globalization</h1>
        <p className="page-subtitle">Multi-language UI, RTL support, local time zones, currencies, and regional payroll formats</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ maxWidth: '600px' }} className="form-card">
        <h3>Tenant Region & Locale Preferences</h3>
        <form onSubmit={handleSaveSettings} style={{ marginTop: '16px' }}>
          <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.label}>Default Primary Language</label>
            <select className={styles.input} value={settings.defaultLanguage} onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })} disabled={isPending}>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish (Español)</option>
              <option value="fr-FR">French (Français)</option>
              <option value="de-DE">German (Deutsch)</option>
              <option value="ar-SA">Arabic (العربية)</option>
            </select>
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.label}>Timezone Context</label>
            <input type="text" className={styles.input} value={settings.timeZone} onChange={e => setSettings({ ...settings, timeZone: e.target.value })} disabled={isPending} />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.label}>Currency Symbol & ISO Code</label>
            <input type="text" className={styles.input} value={settings.currencyCode} onChange={e => setSettings({ ...settings, currencyCode: e.target.value })} disabled={isPending} />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.isRtlSupported} onChange={e => setSettings({ ...settings, isRtlSupported: e.target.checked })} disabled={isPending} />
              Enable Right-To-Left (RTL) Layout Text Alignment
            </label>
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Globalization Settings</button>
        </form>
      </div>
    </div>
  );
}
