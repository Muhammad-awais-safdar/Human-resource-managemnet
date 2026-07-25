'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

export default function LoginPage() {
  const router = useRouter();
  
  // Credentials Step States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPlatformPortal, setIsPlatformPortal] = useState(true);
  const [subdomainName, setSubdomainName] = useState('');
  
  // MFA Step States
  const [mfaEmail, setMfaEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [resolvedTenantId, setResolvedTenantId] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[0] !== 'localhost' && parts[0] !== 'hrm')) {
        const sub = parts[0];
        if (sub !== 'www' && sub !== 'hrm' && sub !== 'app') {
          setIsPlatformPortal(false);
          setSubdomainName(sub);
        }
      }
    }
  }, []);

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
          if (response.tenantId) {
            setResolvedTenantId(response.tenantId);
          }
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
          tenantId: resolvedTenantId,
        });

        if (response.success && response.token) {
          // Write token and identity info to browser cache
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            if (response.tenantId) localStorage.setItem('tenant_id', response.tenantId);
            if (response.subdomain) localStorage.setItem('tenant_subdomain', response.subdomain);
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
    <main suppressHydrationWarning={true} className={styles.authContainer}>
      <div suppressHydrationWarning={true} className={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: isPlatformPortal ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isPlatformPortal ? '#818cf8' : '#34d399',
            border: `1px solid ${isPlatformPortal ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
          }}>
            {isPlatformPortal ? '🛡️ Platform Operations Portal' : `🏢 ${subdomainName.toUpperCase()} Workspace`}
          </span>
        </div>

        <h2 className={styles.title}>
          {isPlatformPortal ? 'Platform Administration' : 'Workspace Login'}
        </h2>
        <p className={styles.subtitle}>
          {isPlatformPortal
            ? 'Sign in with your SaaS Platform Administrator credentials'
            : `Sign in to access your isolated workspace (${subdomainName || 'tenant'})`}
        </p>

        {errors.submit && (
          <div suppressHydrationWarning={true} className={`${styles.alert} ${styles.alertDanger}`}>
            {errors.submit}
          </div>
        )}

        <form suppressHydrationWarning={true} onSubmit={handleLogin} noValidate>
          <div suppressHydrationWarning={true} className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              suppressHydrationWarning={true}
              type="email"
              className={styles.input}
              placeholder={isPlatformPortal ? 'admin@hrm.com' : 'e.g. employee@company.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div suppressHydrationWarning={true} className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              suppressHydrationWarning={true}
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
