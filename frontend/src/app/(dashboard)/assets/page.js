'use client';

import React, { useEffect, useState } from 'react';
import * as suiteService from '../../../services/suiteService';

export default function AssetPage() {
  const [assets, setAssets] = useState([]);
  const [myAssets, setMyAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Add asset form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('LAPTOP');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  // Assign form
  const [assignAssetId, setAssignAssetId] = useState('');
  const [assignEmpId, setAssignEmpId] = useState('');

  const loadData = () => {
    Promise.all([
      suiteService.getAllAssets().catch(() => []),
      suiteService.getMyAssets().catch(() => []),
    ]).then(([all, mine]) => { setAssets(all); setMyAssets(mine); }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      await suiteService.addAsset({ name, category, serialNumber, purchaseDate });
      setMessage('✅ Asset added!'); setName(''); setSerialNumber(''); setPurchaseDate('');
      loadData();
    } catch { setMessage('❌ Failed to add asset.'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const result = await suiteService.assignAsset(assignAssetId, assignEmpId);
      setMessage(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
      setAssignAssetId(''); setAssignEmpId(''); loadData();
    } catch { setMessage('❌ Failed to assign asset.'); }
  };

  const handleReturn = async (assetId) => {
    try {
      const result = await suiteService.returnAsset(assetId);
      setMessage(result.success ? '✅ Asset returned.' : '❌ Failed to return asset.');
      loadData();
    } catch { setMessage('❌ Error returning asset.'); }
  };

  const statusColor = { AVAILABLE: '#10b981', ASSIGNED: '#f59e0b', MAINTENANCE: '#ef4444' };
  const categoryIcons = { HARDWARE: '💻', LAPTOP: '💻', MOBILE: '📱', FURNITURE: '🪑', GENERAL: '📦', VEHICLE: '🚗', OTHER: '🔧' };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.icon}>📦</span>
        <h1 style={styles.title}>Asset Management</h1>
        <p style={styles.subtitle}>Track, assign, and manage company assets across the organization</p>
      </div>

      {message && (
        <div style={{ ...styles.alert, background: message.startsWith('✅') ? '#064e3b' : '#7f1d1d' }}>
          {message}
        </div>
      )}

      {/* Summary Cards */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Assets', value: assets.length, color: '#06b6d4', icon: '📦' },
          { label: 'Available', value: assets.filter(a => a.status === 'AVAILABLE').length, color: '#10b981', icon: '✅' },
          { label: 'Assigned', value: assets.filter(a => a.status === 'ASSIGNED').length, color: '#f59e0b', icon: '🔗' },
          { label: 'My Assets', value: myAssets.length, color: '#818cf8', icon: '👤' },
        ].map(stat => (
          <div key={stat.label} style={styles.statCard}>
            <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
              <p style={{ color: stat.color, fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'all', label: '📋 All Assets' },
          { id: 'mine', label: '👤 My Assets' },
          { id: 'add', label: '➕ Add Asset' },
          { id: 'assign', label: '🔗 Assign Asset' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingBar}><div style={styles.loadingProgress} /></div>
      ) : (
        <div style={styles.card}>
          {/* All Assets */}
          {activeTab === 'all' && (
            assets.length === 0 ? <p style={styles.empty}>No assets found. Add some!</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['', 'Name', 'Category', 'Serial No.', 'Status', 'Assigned To', 'Actions'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((a, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                        <td style={{ ...styles.td, fontSize: '1.2rem' }}>{categoryIcons[a.category] || '📦'}</td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{a.name}</td>
                        <td style={styles.td}>{a.category}</td>
                        <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>{a.serial_number || '—'}</td>
                        <td style={styles.td}>
                          <span style={{ color: statusColor[a.status] || '#64748b', background: `${statusColor[a.status] || '#64748b'}20`, borderRadius: '6px', padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
                            {a.status}
                          </span>
                        </td>
                        <td style={styles.td}>{a.first_name ? `${a.first_name} ${a.last_name}` : '—'}</td>
                        <td style={styles.td}>
                          {a.status === 'ASSIGNED' && (
                            <button style={styles.returnBtn} onClick={() => handleReturn(a.id)}>Return</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* My Assets */}
          {activeTab === 'mine' && (
            myAssets.length === 0 ? <p style={styles.empty}>No assets assigned to you.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {myAssets.map((a, i) => (
                  <div key={i} style={styles.assetCard}>
                    <span style={{ fontSize: '32px' }}>{categoryIcons[a.category] || '📦'}</span>
                    <p style={{ fontWeight: 700, margin: '8px 0 2px' }}>{a.name}</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, fontFamily: 'monospace' }}>{a.serial_number}</p>
                    <span style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 600, marginTop: '6px' }}>{a.status}</span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Add Asset Form */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddAsset} style={styles.form}>
              <label style={styles.label}>Asset Name</label>
              <input style={styles.input} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., MacBook Pro 14" />
              <label style={styles.label}>Category</label>
              <select style={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                {['HARDWARE', 'LAPTOP', 'MOBILE', 'FURNITURE', 'VEHICLE', 'GENERAL', 'OTHER'].map(c => (
                  <option key={c} value={c} style={styles.option}>{c}</option>
                ))}
              </select>
              <label style={styles.label}>Serial Number</label>
              <input style={styles.input} value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Optional" />
              <label style={styles.label}>Purchase Date</label>
              <input type="date" style={styles.input} value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
              <button type="submit" style={styles.button}>Add Asset</button>
            </form>
          )}

          {/* Assign Asset Form */}
          {activeTab === 'assign' && (
            <form onSubmit={handleAssign} style={styles.form}>
              <label style={styles.label}>Asset</label>
              <select style={styles.select} value={assignAssetId} onChange={e => setAssignAssetId(e.target.value)} required>
                <option value="" style={styles.option}>Select available asset…</option>
                {assets.filter(a => a.status === 'AVAILABLE').map((a, i) => (
                  <option key={i} value={a.id} style={styles.option}>{a.name} ({a.serial_number})</option>
                ))}
              </select>
              <label style={styles.label}>Employee ID</label>
              <input style={styles.input} value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} required placeholder="Enter employee UUID" />
              <button type="submit" style={styles.button}>Assign Asset</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '32px' },
  icon: { fontSize: '48px' },
  title: { fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px', background: 'linear-gradient(90deg, #06b6d4, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#94a3b8', fontSize: '0.95rem', margin: 0 },
  alert: { borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', color: '#fff', fontWeight: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' },
  statCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(6,182,212,0.2)', border: '1px solid #06b6d4', color: '#06b6d4' },
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' },
  label: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 },
  input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.9rem', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', cursor: 'pointer' },
  option: { background: '#1e293b', color: '#f1f5f9', padding: '8px' },
  button: { padding: '11px 24px', background: 'linear-gradient(90deg, #06b6d4, #10b981)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', width: 'fit-content' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '0.78rem', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '12px 14px', fontSize: '0.88rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  returnBtn: { padding: '4px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  assetCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  empty: { color: '#475569', textAlign: 'center', padding: '32px 0' },
  loadingBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' },
  loadingProgress: { height: '100%', width: '60%', background: 'linear-gradient(90deg, #06b6d4, #10b981)', borderRadius: '2px' },
};
