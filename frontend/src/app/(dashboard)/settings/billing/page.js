'use client';

import React, { useEffect, useState, useTransition } from 'react';
import billingGatewayService from '../../../../services/billingGatewayService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SubscriptionBillingPage() {
  const [sub, setSub] = useState({ plan_name: 'ENTERPRISE', billingCycle: 'ANNUAL', seatCount: 50, amountUsd: 499.00, status: 'ACTIVE' });
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState('ENTERPRISE');
  const [provider, setProvider] = useState('STRIPE');
  const [seats, setSeats] = useState(50);
  const [billingCycle, setBillingCycle] = useState('ANNUAL');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    billingGatewayService.getSubscription()
      .then(res => { if (res) setSub(res); })
      .catch(err => console.error('Subscription load error:', err));

    billingGatewayService.getPlans()
      .then(res => {
        if (res && res.length > 0) {
          setPlans(res);
          setSelectedPlanCode(res[0].code || 'ENTERPRISE');
        }
      })
      .catch(err => console.error('Plans load error:', err));

    billingGatewayService.getInvoices()
      .then(res => setInvoices(res || []))
      .catch(err => console.error('Invoices load error:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitiateCheckout = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const payload = {
          planCode: selectedPlanCode,
          seatCount: seats,
          billingCycle: billingCycle,
          provider: provider,
          tenantId: 'awais'
        };
        const checkoutRes = await billingGatewayService.createCheckoutSession(payload);
        if (checkoutRes && checkoutRes.checkoutUrl) {
          setMessage(`Redirecting to secure gateway (${checkoutRes.provider || provider})...`);
          setTimeout(() => {
            window.location.href = checkoutRes.checkoutUrl;
          }, 1200);
        } else {
          setMessage('Plan updated successfully. Invoice generated.');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to initiate checkout session.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Subscription & Recurring Billing Engine</h1>
        <p className="page-subtitle">Provider-agnostic SaaS pricing, seat licensing, checkout sessions, and recurring payment history</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {/* Active Subscription Summary */}
        <div style={{ flex: 1, minWidth: '320px' }} className="form-card">
          <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>Active Subscription Context</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Current Tier:</strong>{' '}
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.05rem' }}>{sub.plan_name || sub.planName || 'ENTERPRISE'}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Billing Status:</strong>{' '}
              <span style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-success)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>{sub.status || 'ACTIVE'}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Licensed Seat Capacity:</strong> {sub.seat_count || sub.seatCount || 50} Employees
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Recurring Renewal Rate:</strong> ${sub.amount_usd || sub.amountUsd || 499.00} USD / {sub.billingCycle || 'ANNUAL'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              ℹ️ Auto-renewal powered by provider gateway tokenization. Grace period: 7 days.
            </div>
          </div>
        </div>

        {/* Upgrade / Purchase Plan Form */}
        <div style={{ flex: 1.2, minWidth: '340px' }} className="form-card">
          <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>Purchase or Update Plan</h3>
          <form onSubmit={handleInitiateCheckout}>
            <div className={styles.formGroup} style={{ marginBottom: '14px' }}>
              <label className={styles.label}>Select SaaS Pricing Tier (Managed by Super Admin)</label>
              <select className={styles.input} value={selectedPlanCode} onChange={e => setSelectedPlanCode(e.target.value)} disabled={isPending}>
                {plans.length > 0 ? (
                  plans.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name} — Base ${p.base_price_usd || p.basePriceUsd} + ${p.per_seat_price_usd || p.perSeatPriceUsd}/seat
                    </option>
                  ))
                ) : (
                  <>
                    <option value="STARTER">Starter HR ($49/mo + $5/seat)</option>
                    <option value="PROFESSIONAL">Professional HR ($199/mo + $8/seat)</option>
                    <option value="ENTERPRISE">Enterprise Suite ($499/mo + $10/seat)</option>
                    <option value="BUILD_YOUR_OWN">Custom Modular Plan ($12/seat)</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Seat Count</label>
                <input type="number" min="5" max="5000" className={styles.input} value={seats} onChange={e => setSeats(parseInt(e.target.value) || 10)} disabled={isPending} />
              </div>
              <div style={{ flex: 1 }} className={styles.formGroup}>
                <label className={styles.label}>Billing Cycle</label>
                <select className={styles.input} value={billingCycle} onChange={e => setBillingCycle(e.target.value)} disabled={isPending}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="ANNUAL">Annual (15% Discount)</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.88rem' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '4px' }}>💡 Flexible Add-on Seat Calculation:</div>
              <div>Base Plan Included Capacity: <strong>15 Employees</strong></div>
              <div>Requested Capacity: <strong>{seats} Employees</strong></div>
              <div>
                Add-on Extra Seats:{' '}
                <strong style={{ color: seats > 15 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                  {Math.max(0, seats - 15)} Additional Employees
                </strong>
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ℹ️ No full tier change needed! You are charged base price + per-seat add-on rate ($5/seat) for additional team members.
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Payment Provider Gateway (Global & Pakistan Local)</label>
              <select className={styles.input} value={provider} onChange={e => setProvider(e.target.value)} disabled={isPending}>
                <optgroup label="🇵🇰 Pakistan Local Payment Gateways">
                  <option value="JAZZCASH">JazzCash Pakistan (Mobile Wallet & Cards - PKR)</option>
                  <option value="EASYPAISA">EasyPaisa Pakistan (Mobile Wallet & OTC - PKR)</option>
                  <option value="RAAST_PAKISTAN">State Bank Raast / 1-Link Instant Bank Transfer</option>
                </optgroup>
                <optgroup label="🌍 International Payment Gateways">
                  <option value="STRIPE">Stripe Credit Card / Direct Debit (USD)</option>
                  <option value="PADDLE">Paddle Global Merchant of Record (USD)</option>
                  <option value="LEMON_SQUEEZY">Lemon Squeezy SaaS Gateway (USD)</option>
                  <option value="PAYPAL">PayPal Subscription Billing (USD)</option>
                </optgroup>
              </select>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending} style={{ width: '100%' }}>
              {isPending ? 'Processing Session...' : 'Proceed to Gateway Checkout →'}
            </button>
          </form>
        </div>
      </div>

      {/* Invoice & Payment History */}
      <div className="form-card">
        <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>Billing & Invoice History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invoices.map((inv, idx) => (
            <div key={idx} style={{ padding: '14px 18px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{inv.invoice_number || inv.invoiceNumber || `INV-${2026000 + idx}`}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Amount Charged: ${inv.amount_paid || inv.amountPaid || 499.00} {inv.currency || 'USD'}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold' }}>
                {inv.status || 'PAID'}
              </span>
            </div>
          ))}
          {invoices.length === 0 && (
            <div style={{ padding: '16px', textTransform: 'none', color: 'var(--text-muted)', textAlign: 'center' }}>
              No historical invoices recorded for this tenant.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
