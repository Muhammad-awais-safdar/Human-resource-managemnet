'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) return setError('Activation token is required.');
    if (!password) return setError('Password is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    startTransition(async () => {
      try {
        const res = await apiClient.post('/auth/accept-invite', {
          token,
          password,
        });

        if (res.success) {
          setMessage('Account activated successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setError(res.message || 'Failed to activate account.');
        }
      } catch (err) {
        setError(err.message || 'Failed to activate account.');
      }
    });
  };

  return (
    <div className={styles.card}>
      <header style={{ marginBottom: '24px' }}>
        <h2 className={styles.title}>Activate Account</h2>
        <p className={styles.subtitle} style={{ marginBottom: 0 }}>Complete your employee profile setup to activate login credentials</p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
        {message && <div className={`${styles.alert} ${styles.alertSuccess}`}>{message}</div>}

        <div className={styles.formGroup}>
          <label className={styles.label}>Invitation / Activation Token</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter or paste token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Create Password</label>
          <input
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label>
          <input
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
          {isPending ? 'Activating...' : 'Activate Account & Log In'}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className={styles.authContainer}>
      <Suspense fallback={<div style={{ color: '#fff' }}>Loading activation portal...</div>}>
        <AcceptInviteForm />
      </Suspense>
    </main>
  );
}
