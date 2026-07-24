'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as marketplaceService from '../../../services/marketplaceService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function MarketplacePage() {
  const [plugins, setPlugins] = useState([]);
  const [newPlugin, setNewPlugin] = useState({ pluginName: '', vendor: 'Slack / Microsoft', version: '1.0.0' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    marketplaceService.getPlugins()
      .then(res => setPlugins(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInstallPlugin = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPlugin.pluginName) return setError('Plugin name is required.');

    startTransition(async () => {
      try {
        await marketplaceService.installPlugin(newPlugin);
        setMessage('Marketplace plugin installed successfully.');
        setNewPlugin({ pluginName: '', vendor: 'Slack / Microsoft', version: '1.0.0' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to install plugin.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Integration & Plugin Marketplace</h1>
        <p className="page-subtitle">Installable modules, Slack/Teams notifications, BambooHR sync, and third-party extensions</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Installed Enterprise Extensions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {plugins.map((p, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{p.plugin_name || p.pluginName} (v{p.version})</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Vendor: {p.vendor}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Installed</span>
              </div>
            ))}
            {plugins.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No plugins installed from marketplace.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Install Integration Plugin</h3>
          <form onSubmit={handleInstallPlugin} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Plugin Name</label>
              <input type="text" className={styles.input} placeholder="Slack Time Off Bot" value={newPlugin.pluginName} onChange={e => setNewPlugin({ ...newPlugin, pluginName: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Vendor / Developer</label>
              <input type="text" className={styles.input} placeholder="Slack Technologies" value={newPlugin.vendor} onChange={e => setNewPlugin({ ...newPlugin, vendor: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Version</label>
              <input type="text" className={styles.input} value={newPlugin.version} onChange={e => setNewPlugin({ ...newPlugin, version: e.target.value })} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Install Plugin</button>
          </form>
        </div>
      </div>
    </div>
  );
}
