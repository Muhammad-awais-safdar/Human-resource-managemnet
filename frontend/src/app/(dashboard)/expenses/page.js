'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as expenseService from '../../../services/expenseService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ExpensesPage() {
  const [claims, setClaims] = useState([]);
  const [category, setCategory] = useState('TRAVEL');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    expenseService.getExpenses()
      .then(res => setClaims(Array.isArray(res) ? res : []))
      .catch(err => console.error('Failed to fetch expense claims:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!amount || parseFloat(amount) <= 0) return setError('Please enter a valid expense amount.');

    startTransition(async () => {
      try {
        await expenseService.submitExpense({
          category,
          amount: parseFloat(amount),
          currency,
          description: description.trim() || `${category} Reimbursement Claim`,
        });
        setMessage('Expense reimbursement claim filed successfully!');
        setAmount('');
        setDescription('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to submit expense claim.');
      }
    });
  };

  const handleApprove = (id) => {
    setError('');
    setMessage('');
    startTransition(async () => {
      try {
        await expenseService.approveExpense(id);
        setMessage('Expense claim approved and queued for payout disbursement.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to approve expense.');
      }
    });
  };

  const handleReject = (id) => {
    setError('');
    setMessage('');
    startTransition(async () => {
      try {
        await expenseService.rejectExpense(id);
        setMessage('Expense claim rejected.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to reject expense.');
      }
    });
  };

  // Metrics
  const pendingClaims = claims.filter(c => (c.status || 'PENDING') === 'PENDING');
  const approvedClaims = claims.filter(c => c.status === 'APPROVED');
  const totalApprovedAmount = approvedClaims.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Expense Reimbursements & Claims</h1>
        <p className="page-subtitle">Submit business expense claims, upload receipts, and manage corporate payroll reimbursements</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      {/* Expense Summary Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="form-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL CLAIMS FILED</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{claims.length}</div>
        </div>
        <div className="form-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PENDING APPROVAL</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-warning)', marginTop: '6px' }}>{pendingClaims.length}</div>
        </div>
        <div className="form-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>APPROVED AMOUNT</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-success)', marginTop: '6px' }}>${totalApprovedAmount.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Expense List */}
        <div className="form-card" style={{ flex: 2, minWidth: '400px', margin: 0 }}>
          <h3>Expense Reimbursement Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {claims.map(claim => {
              const status = claim.status || 'PENDING';
              return (
                <div key={claim.id} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{claim.category || 'EXPENSE'}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                        {claim.employeeName || claim.employee_id || 'Employee'}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '3px 8px', 
                      borderRadius: '4px', 
                      fontWeight: '700',
                      background: status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: status === 'APPROVED' ? 'var(--accent-success)' : status === 'REJECTED' ? '#ef4444' : 'var(--accent-warning)'
                    }}>
                      {status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Description: &quot;{claim.description || claim.purpose || 'Business Expense'}&quot;
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                      ${parseFloat(claim.amount || 0).toFixed(2)} {claim.currency || 'USD'}
                    </div>

                    {status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(claim.id)}
                          className={styles.btn}
                          style={{ padding: '6px 14px', fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-success)', border: '1px solid var(--accent-success)' }}
                          disabled={isPending}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(claim.id)}
                          className={styles.btn}
                          style={{ padding: '6px 14px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444' }}
                          disabled={isPending}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {claims.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No expense claims filed yet.</p>
            )}
          </div>
        </div>

        {/* Submit New Expense Form */}
        <div className="form-card" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
          <h3>Submit Expense Claim</h3>
          <form onSubmit={handleSubmitExpense} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Category</label>
              <select className={styles.input} value={category} onChange={e => setCategory(e.target.value)} disabled={isPending}>
                <option value="TRAVEL">✈️ Travel & Lodging</option>
                <option value="MEALS">🍔 Meals & Entertainment</option>
                <option value="SUPPLIES">💻 Office Supplies & Hardware</option>
                <option value="SUBSCRIPTIONS">⚡ Software & SaaS Tools</option>
                <option value="OTHER">📦 Other Business Expenses</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div className={styles.formGroup} style={{ flex: 2 }}>
                <label className={styles.label}>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.input}
                  placeholder="150.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Currency</label>
                <select className={styles.input} value={currency} onChange={e => setCurrency(e.target.value)} disabled={isPending}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PKR">PKR (Rs)</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Expense Note / Description</label>
              <textarea
                className={styles.input}
                rows={3}
                placeholder="Client lunch meeting receipt"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isPending}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }} disabled={isPending}>
              Submit Expense Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
