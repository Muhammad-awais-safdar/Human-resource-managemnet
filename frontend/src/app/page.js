'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Building2,
  Users,
  DollarSign,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Server,
  Database,
  Play
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeVertical, setActiveVertical] = useState('GENERAL');
  const [activeRolePreview, setActiveRolePreview] = useState('TENANT_ADMIN');

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  const verticals = [
    {
      id: 'GENERAL',
      label: '🏢 General Enterprise',
      icon: Building2,
      desc: 'Complete workforce directory, org hierarchy, attendance tracking, and automated payroll calculations.',
      badges: ['Core HR', 'Global Payroll', 'Org Chart', 'Approvals']
    },
    {
      id: 'HEALTHCARE',
      label: '🏥 Healthcare & Clinical',
      icon: Users,
      desc: 'Clinical license compliance, nursing shift rotation, doctor on-call allowances, and HIPAA audit trails.',
      badges: ['Clinical LMS', 'Shift Rotation', 'License Audit', 'HIPAA Logs']
    },
    {
      id: 'IT_SERVICES',
      label: '💻 IT & Software Services',
      icon: Cpu,
      desc: 'Developer billable timesheets, project cost centers, Git commit activity sync, and remote ESS.',
      badges: ['Dev Timesheets', 'Billable Hours', 'Project Costs', 'Remote ESS']
    },
    {
      id: 'MANUFACTURING',
      label: '🏭 Manufacturing & Factory',
      icon: Server,
      desc: 'Piece-rate production wages, shift differential pay, factory line attendance, and safety compliance.',
      badges: ['Piece-Rate Wage', 'Shift Differential', 'Overtime Rules', 'Factory Safety']
    },
    {
      id: 'AGRICULTURE',
      label: '🌾 Agritech & Agriculture',
      icon: Layers,
      desc: 'Seasonal crop yield harvesting bonuses, field worker check-in, and agricultural labor accounting.',
      badges: ['Crop Yield Pay', 'Seasonal Roster', 'Field GPS Checkin', 'Agritech LMS']
    },
    {
      id: 'RETAIL',
      label: '🛒 Retail & Supermarkets',
      icon: BarChart3,
      desc: 'Store POS sales commission splits, multi-branch shift swaps, and hourly store staff rostering.',
      badges: ['POS Commission', 'Store Rostering', 'Shift Swapping', 'Overtime Pay']
    }
  ];

  const rolePreviews = {
    SYSTEM_ADMIN: {
      title: '👑 SaaS Platform Owner Portal',
      roleTag: 'SYSTEM_ADMIN',
      desc: 'Global multi-tenant metrics, physical database schema provisioning, HikariCP connection pool health, and platform-wide security audit logs.',
      kpis: [
        { label: 'Active Enterprise Tenants', val: '48 Provisioned' },
        { label: 'Physical PostgreSQL Schemas', val: '48 Isolated DBs' },
        { label: 'Platform Uptime SLA', val: '99.99% Guaranteed' },
        { label: 'Global HikariCP Pool', val: 'Healthy / Active' }
      ],
      quickActions: ['Provision New Tenant', 'View SaaS Analytics', 'Audit Ledger', 'System Logs']
    },
    TENANT_ADMIN: {
      title: '🏢 Tenant Executive & HR Dashboard',
      roleTag: 'TENANT_ADMIN',
      desc: 'Manage company legal entities, cost centers, department org charts, payroll engine runs, and custom RBAC security matrices.',
      kpis: [
        { label: 'Total Active Workforce', val: '1,248 Employees' },
        { label: 'Monthly Payroll Run', val: '$1.42M Cleared' },
        { label: 'Department Structure', val: '14 Units Active' },
        { label: 'Pending HR Approvals', val: '3 Action Items' }
      ],
      quickActions: ['Run Payroll Engine', 'Manage Org Chart', 'Configure RBAC', 'Workspace Settings']
    },
    HR_MANAGER: {
      title: '👥 HR Department Manager Portal',
      roleTag: 'HR_MANAGER',
      desc: 'Approve employee leave requests, oversee recruitment candidate pipelines, monitor shift rosters, and process expense claims.',
      kpis: [
        { label: 'Open ATS Job Requisitions', val: '12 Active Positions' },
        { label: 'Leave Requests Pending', val: '5 Need Review' },
        { label: 'Upcoming Performance Reviews', val: '18 Scheduled' },
        { label: 'Attendance Compliance', val: '98.4% On Time' }
      ],
      quickActions: ['Review Approvals', 'ATS Candidate Pipeline', 'Leave Management', 'Performance Reviews']
    },
    EMPLOYEE: {
      title: '👤 Employee Self-Service (ESS) Portal',
      roleTag: 'EMPLOYEE',
      desc: 'View personal digital payslips, request vacation leave, check work shift rosters, submit expense claims, and track career learning.',
      kpis: [
        { label: 'Vacation Allowance', val: '18 Days Remaining' },
        { label: 'Current Work Shift', val: '09:00 - 17:00' },
        { label: 'Latest Payslip Status', val: 'Paid (Direct Deposit)' },
        { label: 'LMS Learning Status', val: '2 Courses Enrolled' }
      ],
      quickActions: ['Request Leave', 'Submit Expense Claim', 'View Payslips', 'My ESS Profile']
    }
  };

  const currentRoleInfo = rolePreviews[activeRolePreview];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-lg shadow-indigo-500/30" />
        <span className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Awais HR Enterprise</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-[-200px] w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-2/3 right-[-200px] w-[500px] h-[500px] bg-indigo-600/15 blur-[140px] pointer-events-none z-0" />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Key Features</a>
            <a href="#verticals" className="hover:text-white transition-colors">Industry Verticals</a>
            <a href="#portals" className="hover:text-white transition-colors">Role Portals</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Isolation</a>
          </nav>

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

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-indigo-300">
            Next-Gen Enterprise Human Capital Management Platform
          </span>
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500 text-slate-950">
            v2.4 Live
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Unified Multi-Tenant HR Engine Built for{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Global Enterprise Operations
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Empower your enterprise workforce with physical database-per-tenant isolation, automated payroll calculation, granular RBAC access controls, and industry vertical capabilities.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/35 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Live Workspace</span>
          </Link>

          <Link
            href="/roles"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Explore RBAC Matrix</span>
          </Link>
        </div>

        {/* Quick Highlights */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Physical PostgreSQL Schema Isolation
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            WCAG 2.2 AA Accessibility Compliant
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Interactive Guided Product Tour
          </span>
        </div>

        {/* DASHBOARD PREVIEW CARD */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-indigo-500/30 via-slate-800/50 to-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50">
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              {/* Window Bar Header */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">app.awais-hr.com / dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Tenant Alpha • Live Production</span>
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="p-6 text-left space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Live Executive Overview</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Enterprise Global HR Metrics</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      HikariCP Pool: 100% Active
                    </span>
                  </div>
                </div>

                {/* 4 Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Workforce</span>
                    <div className="text-2xl font-black text-white">1,248</div>
                    <span className="text-[11px] text-emerald-400 font-semibold">↑ +12 this month</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Payroll Executed</span>
                    <div className="text-2xl font-black text-emerald-400">$1,420,500</div>
                    <span className="text-[11px] text-emerald-400 font-semibold">✓ Cleared via Direct ACH</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Pending Approvals</span>
                    <div className="text-2xl font-black text-amber-400">3 Items</div>
                    <span className="text-[11px] text-amber-300 font-semibold">2 Leaves, 1 Expense</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Active Departments</span>
                    <div className="text-2xl font-black text-purple-400">14 Units</div>
                    <span className="text-[11px] text-purple-300 font-semibold">Fully Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Architectural Foundation</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered for High-Scale Enterprise Compliance
          </h2>
          <p className="text-sm text-slate-400">
            Built from the ground up to solve complex enterprise HR requirements without sacrificing UI elegance or performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Physical Tenant Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every enterprise client gets a dedicated PostgreSQL database schema, preventing cross-tenant data leaks and enabling custom migration schedules.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Global Payroll</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configurable tax brackets, allowance rules, deduction policies, automated bank export clearing, and direct ACH file generation.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Fine-Grained RBAC Matrix</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Role permissions organized hierarchically (<code className="text-[11px] font-mono text-indigo-300">Module → Feature → Action</code>) with developer key toggles and maker-checker authorization guards.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Guided Product Tour & Help</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive data-driven product tour engine, 10-step tenant setup wizard, searchable in-app help center, and release changelog.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Recruitment & ATS Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidate pipeline tracking, milestone clearance, automated job board publishing, interview scheduling, and offer letter workflows.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">WCAG 2.2 AA Accessibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized touch targets (min 44px), high-contrast focus rings, keyboard traps, ARIA landmarks, and responsive mobile drawers.
            </p>
          </div>
        </div>
      </section>

      {/* INDUSTRY VERTICALS SHOWCASE */}
      <section id="verticals" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Tailored Capability Modules</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            12+ Pre-Configured Industry Verticals
          </h2>
          <p className="text-sm text-slate-400">
            Switch your tenant vertical context on-the-fly to unlock domain-specific payroll rules, attendance check-ins, and compliance workflows.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {verticals.map((vert) => (
            <button
              key={vert.id}
              onClick={() => setActiveVertical(vert.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeVertical === vert.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{vert.label}</span>
            </button>
          ))}
        </div>

        {/* Active Vertical Card */}
        {(() => {
          const vert = verticals.find((v) => v.id === activeVertical);
          const Icon = vert.icon;

          return (
            <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Icon className="w-10 h-10" />
              </div>
              <div className="space-y-4 text-center md:text-left flex-1">
                <h3 className="text-xl font-bold text-white">{vert.label} Module</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{vert.desc}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                  {vert.badges.map((b, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ROLE PORTAL PREVIEW */}
      <section id="portals" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Role-Aware Navigation Shell</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tailored Experiences for Every Enterprise Persona
          </h2>
          <p className="text-sm text-slate-400">
            The platform dynamically adapts menus, action buttons, and analytics based on JWT role claims.
          </p>
        </div>

        {/* Role Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-8">
          {Object.keys(rolePreviews).map((rKey) => (
            <button
              key={rKey}
              onClick={() => setActiveRolePreview(rKey)}
              className={`p-3.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                activeRolePreview === rKey
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {rolePreviews[rKey].roleTag}
            </button>
          ))}
        </div>

        {/* Active Role Card View */}
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                Active Portal View
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{currentRoleInfo.title}</h3>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Test This Role in Dashboard
            </Link>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{currentRoleInfo.desc}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentRoleInfo.kpis.map((kpi, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">{kpi.label}</span>
                <span className="text-sm font-extrabold text-white mt-1 block">{kpi.val}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Primary Quick Action Access:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentRoleInfo.quickActions.map((qa, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-3 py-1 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-500/30"
                >
                  ⚡ {qa}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Modernize Your HR Operations?
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">
            Experience the next-generation enterprise SaaS platform with automated onboarding, interactive tours, and physical tenant database isolation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Launch Live Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              A
            </div>
            <span className="font-bold text-white">Awais HR Enterprise SaaS Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/roles" className="hover:text-white transition-colors">RBAC Roles</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <div>
            © {new Date().getFullYear()} Awais HR Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
