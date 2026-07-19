'use client';

import React, { useEffect, useState } from 'react';
import * as suiteService from '../../../services/suiteService';

export default function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [name, setName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [regionalHolidays, setRegionalHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadHolidays = () => {
    suiteService.getHolidays().then(res => setHolidays(res)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadHolidays(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await suiteService.addHoliday({ name, holidayDate, description });
      setMessage('✅ Holiday added successfully!');
      setName(''); setHolidayDate(''); setDescription('');
      loadHolidays();
    } catch (err) { setMessage('❌ Failed to add holiday.'); }
  };

  const handleLoadRegional = async () => {
    if (!region.trim()) return;
    try {
      const data = await suiteService.getRegionalHolidays(region);
      setRegionalHolidays(data);
    } catch (err) { setMessage('❌ Failed to load regional holidays.'); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.icon}>🏖️</span>
        <h1 style={styles.title}>Holiday Management</h1>
        <p style={styles.subtitle}>Manage company-wide and regional holidays</p>
      </div>

      {message && (
        <div style={{ ...styles.alert, background: message.startsWith('✅') ? '#064e3b' : '#7f1d1d' }}>
          {message}
        </div>
      )}

      <div style={styles.grid}>
        {/* Add Holiday Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>➕ Add Holiday</h2>
          <form onSubmit={handleAdd} style={styles.form}>
            <label style={styles.label}>Holiday Name</label>
            <input style={styles.input} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Independence Day" />
            <label style={styles.label}>Date</label>
            <input type="date" style={styles.input} value={holidayDate} onChange={e => setHolidayDate(e.target.value)} required />
            <label style={styles.label}>Description</label>
            <textarea style={{ ...styles.input, height: '80px', resize: 'none' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." />
            <button type="submit" style={styles.button}>Add Holiday</button>
          </form>
        </div>

        {/* Regional Holidays */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🌍 Regional Holidays</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input style={{ ...styles.input, flex: 1, marginBottom: 0 }} value={region} onChange={e => setRegion(e.target.value)} placeholder="Enter region code (e.g., APAC)" />
            <button style={styles.button} onClick={handleLoadRegional}>Load</button>
          </div>
          {regionalHolidays.length === 0 ? (
            <p style={styles.empty}>No regional holidays loaded.</p>
          ) : (
            regionalHolidays.map((h, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.badge}>{h.region}</span>
                <span style={styles.rowText}>{h.name}</span>
                <span style={styles.rowSub}>{h.holiday_date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* All Holidays Table */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📅 All Holidays ({holidays.length})</h2>
        {loading ? (
          <div style={styles.loadingBar}><div style={styles.loadingProgress} /></div>
        ) : holidays.length === 0 ? (
          <p style={styles.empty}>No holidays configured.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Name', 'Date', 'Description'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holidays.map((h, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <td style={styles.td}>{h.name}</td>
                    <td style={styles.td}>{h.holiday_date}</td>
                    <td style={styles.td}>{h.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '32px' },
  icon: { fontSize: '48px' },
  title: { fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px', background: 'linear-gradient(90deg, #06b6d4, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#94a3b8', fontSize: '0.95rem', margin: 0 },
  alert: { borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', color: '#fff', fontWeight: 500, fontSize: '0.95rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' },
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 },
  input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '4px' },
  button: { padding: '10px 20px', background: 'linear-gradient(90deg, #06b6d4, #6366f1)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' },
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  badge: { background: 'rgba(6,182,212,0.2)', color: '#06b6d4', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 },
  rowText: { flex: 1, fontSize: '0.9rem' },
  rowSub: { color: '#64748b', fontSize: '0.8rem' },
  empty: { color: '#475569', textAlign: 'center', padding: '32px 0', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '12px 16px', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  loadingBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' },
  loadingProgress: { height: '100%', width: '60%', background: 'linear-gradient(90deg, #06b6d4, #6366f1)', borderRadius: '2px', animation: 'pulse 1.5s infinite' },
};
