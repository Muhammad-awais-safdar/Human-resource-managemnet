'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as billingService from '../../../../services/billingService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SubscriptionBillingPage() {
  const [sub, setSub] = useState({ planName: 'ENTERPRISE_TIER', billingCycle: 'MONTHLY', seatCount: 50, amountUsd: 499.00, status: 'ACTIVE' });
  const [invoices, setInvoices] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('GROWTH_TIER');
  const [seats, setSeats] = useState(25);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    billingService.getSubscription()
      .then(res => { if (res && res.planName) setSub(res); })
      .catch(err => console.error(err));

    billingService.getInvoices()
      .then(res => setInvoices(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdatePlan = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await billingService.updatePlan({ planName: selectedPlan, seatCount: seats, billingCycle: 'MONTHLY' });
        setMessage('Subscription plan updated and invoice generated.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to update subscription.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Subscription & Billing Engine</h1>
        <p className="page-subtitle">Module-based pricing, seat management, Stripe billing portal, payment history, and PDF invoices</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Current Active Subscription</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Tier:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{sub.plan_name || sub.planName}</span></div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Status:</strong> <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{sub.status}</span></div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Licensed Seats:</strong> {sub.seat_count || sub.seatCount} Employees</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Monthly Charge:</strong> ${sub.amount_usd || sub.amountUsd} USD / month</div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Change Plan / Adjust Seat Count</h3>
          <form onSubmit={handleUpdatePlan} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Subscription Tier</label>
              <select className={styles.input} value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} disabled={isPending}>
                <option value="STARTER_TIER">Starter Tier ($10/seat)</option>
                <option value="GROWTH_TIER">Growth Tier ($15/seat)</option>
                <option value="ENTERPRISE_TIER">Enterprise Unlimited ($20/seat)</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Seat Quantity</label>
              <input type="number" min="5" max="5000" className={styles.input} value={seats} onChange={e => setSeats(parseInt(e.target.value) || 10)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Update Subscription</button>
          </form>
        </div>
      </div>

      <div className="form-card">
        <h3>Invoice Payment History</h3>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invoices.map((inv, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{inv.invoice_number || inv.invoiceNumber}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount: ${inv.amount_paid || inv.amountPaid} {inv.currency || 'USD'}</div>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{inv.status}</span>
            </div>
          ))}
          {invoices.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No invoices generated yet.</p>}
        </div>
      </div>
    </div>
  );
}
