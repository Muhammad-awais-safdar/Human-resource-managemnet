'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as accService from '../../../services/accessibilityService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function AccessibilityPage() {
  const [prefs, setPrefs] = useState({
    highContrast: false,
    screenReaderOptimized: true,
    fontScalePercent: 100
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    accService.getPreferences()
      .then(res => {
        if (res && res.fontScalePercent) setPrefs(res);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await accService.updatePreferences(prefs);
        setMessage('Accessibility preferences updated.');
      } catch (err) {
        setError(err.message || 'Failed to update accessibility preferences.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Accessibility & UX Preferences</h1>
        <p className="page-subtitle">WCAG compliance options, high contrast mode, screen reader support, keyboard shortcuts, and font scaling</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ maxWidth: '600px' }} className="form-card">
        <h3>WCAG 2.1 Display Preferences</h3>
        <form onSubmit={handleSavePreferences} style={{ marginTop: '16px' }}>
          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={prefs.highContrast} onChange={e => setPrefs({ ...prefs, highContrast: e.target.checked })} disabled={isPending} />
              Enable High Contrast Visual Mode
            </label>
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={prefs.screenReaderOptimized} onChange={e => setPrefs({ ...prefs, screenReaderOptimized: e.target.checked })} disabled={isPending} />
              Screen Reader Optimization & ARIA Landmarks
            </label>
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
            <label className={styles.label}>Font Scale Percentage ({prefs.fontScalePercent}%)</label>
            <input type="range" min="75" max="150" step="5" value={prefs.fontScalePercent} onChange={e => setPrefs({ ...prefs, fontScalePercent: parseInt(e.target.value) || 100 })} disabled={isPending} style={{ width: '100%' }} />
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Accessibility Options</button>
        </form>
      </div>
    </div>
  );
}
