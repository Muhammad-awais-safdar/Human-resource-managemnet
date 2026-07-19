'use client';

import React, { useEffect, useState } from 'react';
import * as suiteService from '../../../services/suiteService';

export default function PayrollPage() {
  const [payslips, setPayslips] = useState([]);
  const [allPayslips, setAllPayslips] = useState([]);
  const [activeTab, setActiveTab] = useState('mine');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const loadPayslips = () => {
    Promise.all([
      suiteService.getPayslips().catch(() => []),
      suiteService.getAllPayslips().catch(() => []),
    ]).then(([mine, all]) => {
      setPayslips(mine);
      setAllPayslips(all);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadPayslips(); }, []);

  const handleRunPayroll = async () => {
    setRunning(true);
    try {
      const result = await suiteService.runPayroll();
      setLastResult(result);
      setMessage('✅ Payroll processed successfully!');
      loadPayslips();
    } catch (err) {
      setMessage('❌ ' + (err?.response?.data?.message || 'Failed to run payroll.'));
    } finally { setRunning(false); }
  };

  const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;
  const statusColor = (s) => s === 'PAID' ? '#10b981' : '#f59e0b';

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.icon}>💰</span>
        <h1 style={styles.title}>Payroll Engine</h1>
        <p style={styles.subtitle}>Process salaries and view payslips across the organization</p>
      </div>

      {message && (
        <div style={{ ...styles.alert, background: message.startsWith('✅') ? '#064e3b' : '#7f1d1d' }}>
          {message}
        </div>
      )}

      {/* Run Payroll Panel */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={styles.cardTitle}>⚙️ Run Payroll Engine</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              Calculates gross, statutory tax (10% if gross &gt; $3000), deductions, and net pay.
            </p>
          </div>
          <button
            onClick={handleRunPayroll}
            disabled={running}
            style={{ ...styles.button, opacity: running ? 0.6 : 1, minWidth: '160px' }}
          >
            {running ? '⏳ Processing…' : '▶ Run Payroll'}
          </button>
        </div>

        {lastResult && (
          <div style={styles.resultGrid}>
            {[
              { label: 'Pay Period', value: lastResult.period, color: '#06b6d4' },
              { label: 'Gross Pay', value: formatCurrency(lastResult.gross), color: '#818cf8' },
              { label: 'Tax Amount', value: formatCurrency(lastResult.taxAmount), color: '#f59e0b' },
              { label: 'Deductions', value: formatCurrency(lastResult.deductions), color: '#f43f5e' },
              { label: 'Net Salary', value: formatCurrency(lastResult.netSalary), color: '#10b981' },
            ].map(({ label, value, color }) => (
              <div key={label} style={styles.resultCard}>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ color, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payslip Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'mine', label: '🧾 My Payslips' },
          { id: 'all', label: '📋 All Payslips' },
        ].map(t => (
          <button key={t.id} style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingBar}><div style={styles.loadingProgress} /></div>
      ) : (
        <div style={styles.card}>
          {(activeTab === 'mine' ? payslips : allPayslips).length === 0 ? (
            <p style={styles.empty}>No payslips found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {(activeTab === 'mine'
                      ? ['Pay Period', 'Net Salary', 'Status']
                      : ['Employee', 'Email', 'Pay Period', 'Net Salary', 'Status']
                    ).map(h => <th key={h} style={styles.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'mine' ? payslips : allPayslips).map((p, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                      {activeTab === 'all' && (
                        <>
                          <td style={styles.td}>{p.first_name} {p.last_name}</td>
                          <td style={styles.td}>{p.email}</td>
                        </>
                      )}
                      <td style={styles.td}>{p.pay_period}</td>
                      <td style={{ ...styles.td, fontWeight: 700, color: '#10b981' }}>{formatCurrency(p.net_salary)}</td>
                      <td style={styles.td}>
                        <span style={{ color: statusColor(p.status), background: `${statusColor(p.status)}20`, borderRadius: '6px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  title: { fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px', background: 'linear-gradient(90deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#94a3b8', fontSize: '0.95rem', margin: 0 },
  alert: { borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', color: '#fff', fontWeight: 500 },
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '20px' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' },
  button: { padding: '12px 24px', background: 'linear-gradient(90deg, #10b981, #06b6d4)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', transition: 'opacity 0.2s' },
  resultGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '20px' },
  resultCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '16px' },
  tab: { padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' },
  tabActive: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '12px 16px', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  empty: { color: '#475569', textAlign: 'center', padding: '32px 0' },
  loadingBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' },
  loadingProgress: { height: '100%', width: '60%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '2px' },
};
