'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: MFA Code, 3: New Password
  const [email, setEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestReset = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }
    setError('');
    setMessage('');
    
    startTransition(async () => {
      // Simulate sending token request to backend
      setTimeout(() => {
        setMessage('MFA security verification code sent to your email.');
        setStep(2);
      }, 1000);
    });
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (!mfaCode) {
      setError('MFA security verification code is required.');
      return;
    }
    setError('');
    setMessage('');
    
    startTransition(async () => {
      // Simulate verifying MFA token with backend
      setTimeout(() => {
        if (mfaCode.length === 6) {
          setMessage('Identity verified. Please set your new password.');
          setStep(3);
        } else {
          setError('Invalid MFA code. Please input a 6-digit code.');
        }
      }, 800);
    });
  };

  const handleSetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setMessage('');
    
    startTransition(async () => {
      // Simulate updating password in backend
      setTimeout(() => {
        setMessage('Your password has been successfully reset. Redirecting...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }, 1200);
    });
  };

  return (
    <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b' }}>
      <div className={styles.card} style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Security Recovery</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Restore access to your secure workspace context.</p>
        </div>

        {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '16px' }}>{error}</div>}
        {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '16px' }}>{message}</div>}

        {/* STEP 1: Request Email Reset */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} noValidate>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Corporate Email Address</label>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }} disabled={isPending}>
              Request Verification Code
            </button>
          </form>
        )}

        {/* STEP 2: Input MFA Code Card */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} noValidate>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>6-Digit Security Recovery Code</label>
              <input 
                type="text" 
                maxLength={6}
                className={styles.input} 
                placeholder="e.g. 123456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', fontWeight: '700' }}
                disabled={isPending}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>Check your inbox or authenticator app for the challenge code.</p>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }} disabled={isPending}>
              Verify Code
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className={styles.btn} 
              style={{ width: '100%', marginTop: '8px', border: '1px solid var(--border-light)', background: 'none', color: 'var(--text-secondary)' }}
              disabled={isPending}
            >
              Back to Request
            </button>
          </form>
        )}

        {/* STEP 3: Reset Password Form */}
        {step === 3 && (
          <form onSubmit={handleSetPassword} noValidate>
            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <label className={styles.label}>New Secure Password</label>
              <input 
                type="password" 
                className={styles.input} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Confirm New Password</label>
              <input 
                type="password" 
                className={styles.input} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }} disabled={isPending}>
              Update Password
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '600' }}>
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
