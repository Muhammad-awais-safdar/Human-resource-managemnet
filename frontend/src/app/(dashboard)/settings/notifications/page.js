'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as notificationService from '../../../../services/smartNotificationService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SmartNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [prefs, setPrefs] = useState({ userEmail: 'user@workforceos.com', emailEnabled: true, inAppEnabled: true, pushEnabled: false });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    notificationService.getMyNotifications()
      .then(res => setNotifications(res || []))
      .catch(err => console.error(err));

    notificationService.getPreferences()
      .then(res => { if (res && res.userEmail) setPrefs(res); })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAllRead = () => {
    notificationService.markAllRead()
      .then(() => {
        setMessage('All notifications marked as read.');
        loadData();
      })
      .catch(err => setError(err.message || 'Failed to mark read.'));
  };

  const handleSavePrefs = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await notificationService.updatePreferences(prefs);
        setMessage('Notification channel preferences updated.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to save preferences.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Smart Notification & Alert Center</h1>
        <p className="page-subtitle">Real-time SSE event delivery, category subscriptions, email digests, and push notification settings</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>In-App Alert Feed</h3>
            <button onClick={handleMarkAllRead} className={`${styles.btn} ${styles.btnPrimary}`} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Mark All Read</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((n, idx) => (
              <div key={idx} style={{ padding: '16px', background: n.is_read || n.isRead ? 'var(--bg-tertiary)' : 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{n.title}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{n.message}</p>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{n.category}</span>
              </div>
            ))}
            {notifications.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No unread notifications.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Channel Preferences</h3>
          <form onSubmit={handleSavePrefs} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={prefs.emailEnabled} onChange={e => setPrefs({ ...prefs, emailEnabled: e.target.checked })} disabled={isPending} />
                Send Email Digest & Instant Alerts
              </label>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={prefs.inAppEnabled} onChange={e => setPrefs({ ...prefs, inAppEnabled: e.target.checked })} disabled={isPending} />
                Enable In-App Bell Notifications
              </label>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={prefs.pushEnabled} onChange={e => setPrefs({ ...prefs, pushEnabled: e.target.checked })} disabled={isPending} />
                Mobile Push Notifications (FCM PWA)
              </label>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Notification Settings</button>
          </form>
        </div>
      </div>
    </div>
  );
}
