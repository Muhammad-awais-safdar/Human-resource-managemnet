'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as mobileService from '../../../services/mobileEnterpriseService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function MobileEnterprisePage() {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({ deviceName: '', osType: 'ANDROID', isBiometric: true });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    mobileService.getDevices()
      .then(res => setDevices(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterDevice = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newDevice.deviceName) return setError('Device name is required.');

    startTransition(async () => {
      try {
        await mobileService.registerDevice(newDevice);
        setMessage('Mobile device registered.');
        setNewDevice({ deviceName: '', osType: 'ANDROID', isBiometric: true });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to register mobile device.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Mobile Enterprise Suite</h1>
        <p className="page-subtitle">Mobile App registry, biometric login enforcement, push notifications, and offline attendance sync</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Registered Employee Devices</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {devices.map((d, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{d.device_name || d.deviceName} ({d.os_type || d.osType})</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Biometric Lock: {(d.is_biometric || d.isBiometric) ? 'Enabled' : 'Disabled'} | FCM Token Registered
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{d.status}</span>
              </div>
            ))}
            {devices.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No mobile devices registered.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Register Device</h3>
          <form onSubmit={handleRegisterDevice} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Device Model / Label</label>
              <input type="text" className={styles.input} placeholder="Awais Samsung Galaxy S24" value={newDevice.deviceName} onChange={e => setNewDevice({ ...newDevice, deviceName: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Mobile Operating System</label>
              <select className={styles.input} value={newDevice.osType} onChange={e => setNewDevice({ ...newDevice, osType: e.target.value })} disabled={isPending}>
                <option value="ANDROID">Android OS</option>
                <option value="IOS">Apple iOS</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newDevice.isBiometric} onChange={e => setNewDevice({ ...newDevice, isBiometric: e.target.checked })} disabled={isPending} />
                Require Biometric Authentication
              </label>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Register Device</button>
          </form>
        </div>
      </div>
    </div>
  );
}
