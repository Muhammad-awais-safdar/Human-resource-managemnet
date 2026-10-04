'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '../../../services/api';
import { Shield, Sparkles, ArrowRight, Lock } from 'lucide-react';

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
          setTimeout(() => {
            setIsPlatformPortal(false);
            setSubdomainName(sub);
          }, 0);
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
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            if (response.tenantId) localStorage.setItem('tenant_id', response.tenantId);
            if (response.subdomain) localStorage.setItem('tenant_subdomain', response.subdomain);
          }
          router.push('/dashboard');
        }
      } catch (err) {
        setErrors({ mfa: err.message || 'Verification failed. Please check the code.' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-[-200px] w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-2/3 right-[-200px] w-[500px] h-[500px] bg-indigo-600/15 blur-[140px] pointer-events-none z-0" />

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
              href="/"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Home
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

      {/* CENTERED LOGIN CARD */}
      <main className="relative z-10 my-auto py-12 px-4 flex items-center justify-center">
        {mfaEmail ? (
          /* MFA Verification Form */
          <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                <Lock className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">Secure Verification</h2>
              <p className="text-xs text-slate-300">
                Enter the 6-digit MFA security code generated for <strong className="text-indigo-400">{mfaEmail}</strong>
              </p>
            </div>

            {errors.mfa && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-medium text-center">
                {errors.mfa}
              </div>
            )}

            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">6-Digit Security Code</label>
                <input
                  type="text"
                  className="w-full h-12 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-lg font-bold text-center tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="123456"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {isPending ? 'Verifying Code...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                className="w-full h-11 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
                onClick={() => { setMfaEmail(''); setMfaCode(''); setErrors({}); }}
                disabled={isPending}
              >
                Back to Credentials
              </button>
            </form>
          </div>
        ) : (
          /* Credentials Form */
          <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                A
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-xs font-bold text-indigo-300">
                {isPlatformPortal ? '🛡️ Platform Operations Portal' : `🏢 ${subdomainName.toUpperCase()} Workspace`}
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                {isPlatformPortal ? 'Platform Administration' : 'Workspace Login'}
              </h2>
              <p className="text-xs text-slate-300">
                {isPlatformPortal
                  ? 'Sign in with your SaaS Platform Administrator credentials'
                  : `Sign in to access your isolated workspace (${subdomainName || 'tenant'})`}
              </p>
            </div>

            {errors.submit && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-medium">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <input
                  type="email"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder={isPlatformPortal ? 'admin@hrm.com' : 'e.g. employee@company.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                  <Link href="/reset-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {isPending ? 'Verifying credentials...' : 'Log In'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Don&apos;t have a workspace?{' '}
              <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Provision New Tenant Workspace
              </Link>
            </div>
          </div>
        )}
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
