'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as approvalsService from '../../../services/approvalsService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ApprovalsInboxPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [comment, setComment] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState(''); // APPROVE or REJECT

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadApprovals = () => {
    approvalsService.getPendingApprovals()
      .then(res => {
        if (res.success) {
          setItems(res.data || res.roles || []);
        } else {
          setItems([]);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleActionClick = (item, action) => {
    setSelectedItem(item);
    setActionType(action);
    setComment('');
    setError('');
    setMessage('');
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await approvalsService.actionApproval(
          selectedItem.type,
          selectedItem.id,
          actionType,
          comment
        );

        if (res.success) {
          setMessage(`Request ${actionType.toLowerCase()}d successfully!`);
          setSelectedItem(null);
          loadApprovals();
        } else {
          setError(res.message || 'Failed to process approval action.');
        }
      } catch (err) {
        setError(err.message || 'Failed to process approval action.');
      }
    });
  };

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    return item.type === filter;
  });

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'LEAVE':
        return { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'EXPENSE':
        return { background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' };
      case 'TIMESHEET':
        return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'RESIGNATION':
        return { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'TRAVEL':
        return { background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' };
      case 'CLEARANCE':
        return { background: 'rgba(20, 184, 166, 0.1)', color: '#20b8a6', border: '1px solid rgba(20, 184, 166, 0.2)' };
      default:
        return { background: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.2)' };
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>
          Approvals Inbox
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
          Review and approve pending timesheets, expenses, resignations, and leave requests.
        </p>
      </header>

      {message && (
        <div className={`${styles.alert} ${styles.alertSuccess}`} style={{ marginBottom: '24px' }}>
          {message}
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['ALL', 'LEAVE', 'EXPENSE', 'TIMESHEET', 'RESIGNATION', 'TRAVEL', 'CLEARANCE'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === t ? '1px solid var(--accent-primary)' : '1px solid var(--border-light)',
              background: filter === t ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
              color: filter === t ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            🎉 No pending approvals found in this filter category.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="form-card"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'between',
                padding: '24px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(18, 18, 22, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    ...getBadgeStyle(item.type)
                  }}
                >
                  {item.type}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Code: {item.employee_code || item.EMPLOYEE_CODE || 'N/A'}
                </span>
              </div>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>
                {item.first_name || item.FIRST_NAME} {item.last_name || item.LAST_NAME}
              </h4>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 16px 0', lineHeight: '1.4', flex: 1 }}>
                {item.details || item.DETAILS}
              </p>

              {item.reason && (
                <blockquote style={{ background: 'var(--bg-tertiary)', borderLeft: '3px solid var(--border-light)', padding: '8px 12px', margin: '0 0 20px 0', borderRadius: '0 4px 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "{item.reason}"
                </blockquote>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button
                  onClick={() => handleActionClick(item, 'APPROVE')}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                  disabled={isPending}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleActionClick(item, 'REJECT')}
                  className={styles.btn}
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  disabled={isPending}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="form-card" style={{ maxWidth: '480px', width: '100%', margin: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
            <h3>Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Are you sure you want to {actionType.toLowerCase()} the <strong>{selectedItem.type}</strong> request for <strong>{selectedItem.first_name} {selectedItem.last_name}</strong>?
            </p>

            <form onSubmit={handleConfirmAction}>
              {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '12px' }}>{error}</div>}

              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Comment / Note (Optional)</label>
                <textarea
                  className={styles.input}
                  rows={3}
                  placeholder="Provide approval reasoning or rejection comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isPending}
                  style={{ resize: 'none', background: 'var(--bg-tertiary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ flex: 1, background: actionType === 'APPROVE' ? 'var(--accent-success)' : 'var(--accent-danger)' }}
                  disabled={isPending}
                >
                  {isPending ? 'Processing...' : `Confirm ${actionType === 'APPROVE' ? 'Approve' : 'Reject'}`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className={styles.btn}
                  style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                  disabled={isPending}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
