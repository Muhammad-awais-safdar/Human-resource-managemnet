import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, Zap } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            A
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Awais <span className="text-blue-500">HR</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all">
            Get Started
          </Link>
        </div>
      </header>

      <main className="my-auto py-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" /> Next-Gen Enterprise Multi-Tenant HR Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Unified HR, Payroll & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Workforce Intelligence Engine
          </span>
        </h1>

        <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Empower your organization with automated payroll disbursement, granular RBAC security, performance appraisals, and multi-tenant SaaS architecture built for enterprise scale.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 font-extrabold text-sm rounded-xl text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Provision Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 font-bold text-sm rounded-xl text-slate-200 transition-all"
          >
            Launch Platform Demo
          </Link>
        </div>

        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <h3 className="text-base font-bold text-white">Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Schema-per-tenant or discriminator isolation with automatic JWT subdomain resolution.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <Users className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Automated Payroll</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Precision tax withholding, direct deposit calculation, and instant payslip generation.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <Zap className="w-6 h-6 text-indigo-400" />
            <h3 className="text-base font-bold text-white">React 19 Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">High-performance SPA powered by React 19, Vite, and centralized CSS design tokens.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        © {new Date().getFullYear()} Awais HR Inc. All rights reserved.
      </footer>
    </div>
  );
}
