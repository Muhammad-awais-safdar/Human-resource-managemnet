'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);
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
      setTimeout(() => {
        setMessage('Your password has been successfully reset. Redirecting...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }, 1200);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-[-200px] w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] pointer-events-none z-0" />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30 border border-indigo-400/30">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                Awais <span className="text-indigo-400">HR</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Enterprise
                </span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* CENTERED CARD */}
      <main className="relative z-10 my-auto py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
              <KeyRound className="w-6 h-6 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">Security Recovery</h2>
            <p className="text-xs text-slate-300">Restore access to your secure workspace context.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-medium text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-medium text-center">
              {message}
            </div>
          )}

          {/* STEP 1: Request Email Reset */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corporate Email Address</label>
                <input
                  type="email"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {isPending ? 'Requesting Code...' : 'Request Verification Code'}
              </button>
            </form>
          )}

          {/* STEP 2: Input MFA Code Card */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">6-Digit Security Recovery Code</label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full h-12 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-lg font-bold text-center tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  disabled={isPending}
                />
                <p className="text-[11px] text-slate-400 text-center">Check your inbox or authenticator app for the challenge code.</p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {isPending ? 'Verifying Code...' : 'Verify Code'}
              </button>

              <button
                type="button"
                className="w-full h-11 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
                onClick={() => setStep(1)}
                disabled={isPending}
              >
                Back to Request
              </button>
            </form>
          )}

          {/* STEP 3: Reset Password Form */}
          {step === 3 && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">New Secure Password</label>
                <input
                  type="password"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {isPending ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
              A
            </div>
            <span className="font-semibold text-slate-300">Awais HR Enterprise SaaS</span>
          </div>
          <div>
            © {new Date().getFullYear()} Awais HR Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
