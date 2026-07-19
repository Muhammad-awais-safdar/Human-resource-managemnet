'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

export default function LoginPage() {
  const router = useRouter();
  
  // Credentials Step States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // MFA Step States
  const [mfaEmail, setMfaEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!email) return setErrors({ submit: 'Email address is required' });
    if (!password) return setErrors({ submit: 'Password is required' });

    startTransition(async () => {
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        
        if (response.success && response.mfaRequired) {
          // Transit to MFA Verification step
          setMfaEmail(response.email);
        }
      } catch (err) {
        setErrors({ submit: err.message || 'Authentication failed. Please verify your credentials.' });
      }
    });
  };

  const handleVerifyMfa = (e) => {
    e.preventDefault();
    setErrors({});

    if (!mfaCode) return setErrors({ mfa: 'Verification code is required' });

    startTransition(async () => {
      try {
        const response = await apiClient.post('/auth/mfa/verify', {
          email: mfaEmail,
          code: mfaCode,
        });

        if (response.success && response.token) {
          // Write token and identity info to browser cache
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          // Redirect directly to dashboard workspace home
          router.push('/dashboard');
        }
      } catch (err) {
        setErrors({ mfa: err.message || 'Verification failed. Please check the code.' });
      }
    });
  };

  // Render MFA Verification Form
  if (mfaEmail) {
    return (
      <main className={styles.authContainer}>
        <div className={styles.card}>
          <h2 className={styles.title}>Secure Verification</h2>
          <p className={styles.subtitle}>
            Enter the 6-digit MFA security code generated for <strong>{mfaEmail}</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-8px', marginBottom: '20px' }}>
            Hint: Default development MFA verification code is <code>123456</code>.
          </p>

          {errors.mfa && (
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              {errors.mfa}
            </div>
          )}

          <form onSubmit={handleVerifyMfa} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.label}>6-Digit Security Code</label>
              <input
                type="text"
                className={styles.input}
                placeholder="123456"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                required
                disabled={isPending}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5em', fontWeight: '700' }}
              />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
              {isPending ? 'Verifying Code...' : 'Verify & Continue'}
            </button>

            <button 
              type="button" 
              className={styles.btn} 
              style={{ background: 'none', border: '1px solid var(--border-light)', marginTop: '12px' }}
              onClick={() => { setMfaEmail(''); setMfaCode(''); setErrors({}); }}
              disabled={isPending}
            >
              Back to Credentials
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Render Standard Credentials Form
  return (
    <main className={styles.authContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>Workspace Login</h2>
        <p className={styles.subtitle}>Sign in to access your isolated employee directory</p>

        {errors.submit && (
          <div className={`${styles.alert} ${styles.alertDanger}`}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              className={styles.input}
              placeholder="e.g. admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
            {isPending ? (
              <div className={styles.spinnerWrapper}>
                <div className={styles.spinner} />
                <span>Verifying credentials...</span>
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
