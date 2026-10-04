import React, { useState, useTransition } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '@/core/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [resolvedTenantId, setResolvedTenantId] = useState('');

  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({});

    if (!email) return setErrors({ submit: 'Email address is required' });
    if (!password) return setErrors({ submit: 'Password is required' });

    startTransition(async () => {
      try {
        const response = await authService.login({ email, password });

        if (response.success && response.mfaRequired) {
          setMfaEmail(response.email);
          if (response.tenantId) setResolvedTenantId(response.tenantId);
        } else if (response.token || response.success) {
          login({
            token: response.token,
            user: response.user,
            tenantId: response.tenantId,
            subdomain: response.subdomain,
          });
          navigate('/dashboard');
        }
      } catch (err) {
        setErrors({ submit: err.message || 'Authentication failed. Please check credentials.' });
      }
    });
  };

  const handleVerifyMfa = (e) => {
    e.preventDefault();
    setErrors({});

    if (!mfaCode) return setErrors({ mfa: 'Verification code is required' });

    startTransition(async () => {
      try {
        const response = await authService.verifyMfa({
          email: mfaEmail,
          code: mfaCode,
          tenantId: resolvedTenantId,
        });

        if (response.token || response.success) {
          login({
            token: response.token,
            user: response.user,
            tenantId: response.tenantId,
            subdomain: response.subdomain,
          });
          navigate('/dashboard');
        }
      } catch (err) {
        setErrors({ mfa: err.message || 'Verification code is invalid.' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative flex flex-col justify-between overflow-x-hidden">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            A
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Awais <span className="text-blue-500">HR</span>
          </span>
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
        >
          Provision Workspace
        </Link>
      </header>

      <main className="relative z-10 my-auto py-12 px-4 flex items-center justify-center">
        {mfaEmail ? (
          <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">MFA Verification</h2>
              <p className="text-xs text-slate-400">Enter code for <strong className="text-blue-400">{mfaEmail}</strong></p>
            </div>

            {errors.mfa && <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 text-center">{errors.mfa}</div>}

            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full h-12 text-center text-xl font-bold tracking-widest bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Verifying...' : 'Verify MFA Code'}
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                A
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Workspace Login</h2>
              <p className="text-xs text-slate-400">Sign in to access your HR SaaS operations portal</p>
            </div>

            {errors.submit && <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300">{errors.submit}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@hrm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                  <Link to="/reset-password" className="text-xs text-blue-400 hover:underline">Forgot?</Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Signing In...' : 'Log In'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              Need a new workspace? <Link to="/register" className="font-bold text-blue-400 hover:underline">Provision Tenant</Link>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        © {new Date().getFullYear()} Awais HR Inc. All rights reserved.
      </footer>
    </div>
  );
}
