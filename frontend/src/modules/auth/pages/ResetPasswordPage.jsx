import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Verification link has been sent to your email.');
    setTimeout(() => {
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-4">
      <div className="my-auto w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">Enter your email address to receive password reset instructions.</p>
        </div>

        {message && <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 text-center rounded-lg">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corporate Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white transition-colors cursor-pointer">
            Send Reset Code
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <Link to="/login" className="font-bold text-blue-400 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
