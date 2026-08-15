'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Search, Bell, Command, LogOut, User, Shield, Building2 } from 'lucide-react';
import apiClient from '../../services/api';
import { CommandPaletteModal } from '@/components/shell/CommandPaletteModal';
import { Badge } from '@/components/primitives/Badge';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tenantName, setTenantName] = useState('Workspace');
  const [logoUrl, setLogoUrl] = useState('');
  const [userRole, setUserRole] = useState('TENANT_ADMIN');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  const sidebarNavRef = useRef(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          const r = parsed.role || (parsed.roles ? parsed.roles.split(',')[0] : 'TENANT_ADMIN');
          setTimeout(() => {
            setUserRole(r.toUpperCase());
            setUserName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.email || '');
          }, 0);
        } catch (e) {}
      }
    }
  }, [router]);

  useEffect(() => {
    if (!mounted) return;

    const setupSmoothScroll = (element) => {
      if (!element) return;
      let targetScrollTop = element.scrollTop;
      let animation = null;

      const onWheel = (e) => {
        const delta = e.deltaY;
        const maxScroll = element.scrollHeight - element.clientHeight;
        if (maxScroll <= 0) return;

        e.preventDefault();
        targetScrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop + delta * 0.85));

        if (animation) animation.kill();

        animation = gsap.to(element, {
          scrollTop: targetScrollTop,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto"
        });
      };

      element.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        element.removeEventListener('wheel', onWheel);
        if (animation) animation.kill();
      };
    };

    const cleanupSidebar = setupSmoothScroll(sidebarNavRef.current);
    const cleanupMain = setupSmoothScroll(mainContentRef.current);

    return () => {
      if (cleanupSidebar) cleanupSidebar();
      if (cleanupMain) cleanupMain();
    };
  }, [mounted]);

  useEffect(() => {
    apiClient.get('/tenants/active')
      .then((res) => {
        if (res.success) {
          setTenantName(res.name);
          setLogoUrl(res.logoUrl);
          
          if (res.primaryColor) {
            document.documentElement.style.setProperty('--accent-primary', res.primaryColor);
          }
          if (res.secondaryColor) {
            document.documentElement.style.setProperty('--accent-secondary', res.secondaryColor);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load active tenant branding context", err);
        setIsLoading(false);
      });
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <div suppressHydrationWarning={true} className="dashboard-layout bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col">
      <CommandPaletteModal isOpen={isCmdPaletteOpen} onClose={() => setIsCmdPaletteOpen(false)} />
      
      {/* TOP NAVBAR HEADER */}
      <header className="h-14 bg-[var(--bg-surface-l1)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-7 h-7 rounded-lg object-cover border border-[var(--border-subtle)]" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                {tenantName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-xs tracking-tight text-[var(--text-primary)] hidden sm:inline">{tenantName}</span>
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-subtle)] hidden sm:block" />

          {/* Quick Search Command Palette Trigger */}
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="flex items-center gap-2 bg-[var(--bg-surface-l2)] hover:bg-[var(--bg-surface-l3)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition-all w-48 sm:w-64 justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Search modules or actions...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 font-mono text-[var(--text-secondary)]">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)] transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />

          {/* User Badge */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center text-xs border border-indigo-500/30">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[var(--text-primary)] leading-none">{userName || 'User Session'}</span>
              <span className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">{userRole}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside suppressHydrationWarning={true} className="sidebar w-64 bg-[var(--bg-surface-l1)] border-r border-[var(--border-subtle)] flex flex-col shrink-0">
          <div suppressHydrationWarning={true} className="p-4 border-b border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="sidebar-logo w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="sidebar-logo w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                  {tenantName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="sidebar-title text-xs font-bold text-[var(--text-primary)] truncate">{tenantName}</span>
                <span className="text-[11px] text-[var(--text-muted)] truncate">{userName || 'Active Workspace'}</span>
              </div>
            </div>

            <div>
              {userRole === 'SYSTEM_ADMIN' && (
                <Badge variant="warning" icon={Shield} className="w-full justify-center">
                  SaaS Product Owner
                </Badge>
              )}
              {userRole === 'TENANT_ADMIN' && (
                <Badge variant="primary" icon={Building2} className="w-full justify-center">
                  Tenant Administrator
                </Badge>
              )}
              {userRole === 'HR_MANAGER' && (
                <Badge variant="purple" icon={User} className="w-full justify-center">
                  HR Department Manager
                </Badge>
              )}
              {userRole === 'EMPLOYEE' && (
                <Badge variant="default" icon={User} className="w-full justify-center">
                  Employee Self-Service
                </Badge>
              )}
            </div>
          </div>

          <nav ref={sidebarNavRef} className="sidebar-nav flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">MAIN DASHBOARD</div>
            <Link 
              href="/dashboard" 
              className={`nav-link flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}
            >
              📊 {userRole === 'SYSTEM_ADMIN' ? 'SaaS Super Admin Dashboard' : (userRole === 'TENANT_ADMIN' || userRole === 'HR_MANAGER') ? 'Tenant Org Dashboard' : 'Employee ESS Dashboard'}
            </Link>

            {/* 1. SAAS PLATFORM CONTROL (SYSTEM_ADMIN ONLY) */}
            {userRole === 'SYSTEM_ADMIN' && (
              <>
                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-amber-400 tracking-wider uppercase">👑 SAAS PLATFORM CONTROL</div>
                <Link href="/superadmin/analytics" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/superadmin/analytics') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📈 SaaS Tenant Analytics
                </Link>
                <Link href="/tenants" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/tenants') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🏢 Enterprise Tenant Provisioning
                </Link>
                <Link href="/superadmin/modules" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/superadmin/modules') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🎛️ Feature Flags & Module Control
                </Link>
                <Link href="/superadmin/rbac" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/superadmin/rbac') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🔐 Super Admin RBAC & Security
                </Link>
                <Link href="/superadmin/tenants" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/superadmin/tenants') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🛡️ Super Admin Control
                </Link>
                <Link href="/platform-operations" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/platform-operations') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  ⚙️ Platform Operations
                </Link>
                <Link href="/business-continuity" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/business-continuity') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🛡️ Business Continuity & Failover
                </Link>
                <Link href="/audit" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/audit') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📋 Global Security Audit Ledger
                </Link>
                <Link href="/logs" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/logs') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📊 Platform & Security Logs
                </Link>
                <Link href="/data-migration" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/data-migration') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🔄 Multi-Tenant Data Migration
                </Link>
                <Link href="/api-marketplace" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/api-marketplace') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🔌 API Marketplace
                </Link>
                <Link href="/developer-platform" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/developer-platform') ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  💻 Developer Platform
                </Link>
              </>
            )}

            {/* 2. TENANT ORGANIZATION ADMINISTRATION (TENANT_ADMIN & HR_MANAGER) */}
            {(userRole === 'TENANT_ADMIN' || userRole === 'HR_MANAGER') && (
              <>
                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-indigo-400 tracking-wider uppercase">🏢 ORGANIZATION ADMINISTRATION</div>
                <Link href="/employees" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/employees') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  👥 Employee Directory
                </Link>
                <Link href="/org-chart" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/org-chart') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🏢 Org Chart & Hierarchy
                </Link>
                {userRole === 'TENANT_ADMIN' && (
                  <>
                    <Link href="/settings" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/settings') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                      🎨 Workspace White-labeling
                    </Link>
                    <Link href="/roles" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/roles') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                      🔐 Roles & Security Matrix
                    </Link>
                  </>
                )}
                <Link href="/payroll" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/payroll') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  💰 Payroll Calculation Engine
                </Link>
                <Link href="/payroll/bank-export" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/payroll/bank-export') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🏦 Bank Payroll Export
                </Link>
                <Link href="/approvals" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/approvals') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📥 Approvals Control Center
                </Link>
                <Link href="/recruitment" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/recruitment') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  💼 Recruitment & ATS
                </Link>
                <Link href="/lifecycle" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/lifecycle') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📋 Milestones & Clearance
                </Link>
                <Link href="/assets" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/assets') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📦 Corporate Asset Management
                </Link>
                <Link href="/compliance-management" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/compliance-management') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  ⚖️ Compliance & Audits
                </Link>

                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-sky-400 tracking-wider uppercase">👥 MANAGER PORTAL</div>
                <Link href="/mss" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/mss') ? 'bg-sky-500/15 text-sky-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  👥 Team MSS Portal
                </Link>
              </>
            )}

            {/* 3. RECRUITER ATS NAVIGATION */}
            {userRole === 'RECRUITER' && (
              <>
                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-purple-400 tracking-wider uppercase">💼 TALENT ACQUISITION</div>
                <Link href="/recruitment" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/recruitment') ? 'bg-purple-500/15 text-purple-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  💼 Recruitment & ATS
                </Link>
                <Link href="/lifecycle" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/lifecycle') ? 'bg-purple-500/15 text-purple-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📋 Candidate Milestones
                </Link>
              </>
            )}

            {/* 4. EMPLOYEE SELF-SERVICE (EMPLOYEE, HR_MANAGER & TENANT_ADMIN) */}
            {(userRole === 'EMPLOYEE' || userRole === 'HR_MANAGER' || userRole === 'TENANT_ADMIN') && (
              <>
                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-emerald-400 tracking-wider uppercase">👤 WORKFORCE & SELF-SERVICE</div>
                <Link href="/ess" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/ess') ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  👤 My ESS Portal
                </Link>
                <Link href="/leaves" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/leaves') ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🏖️ Vacation & Leave Requests
                </Link>
                <Link href="/expenses" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/expenses') ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  💼 Expense Claims & Reimbursements
                </Link>
                <Link href="/shifts" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/shifts') ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📅 Shift Schedule
                </Link>
                <Link href="/learning" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/learning') ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  🎓 Learning & LMS
                </Link>
                <Link href="/performance" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/performance') ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                  📈 Performance Reviews
                </Link>
              </>
            )}

            {/* 5. SYSTEM UTILITIES (ALL ROLES) */}
            <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">⚙️ SYSTEM UTILITIES</div>
            <Link href="/profile" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/profile') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
              👤 My Account Profile
            </Link>
            <Link href="/ai-copilot" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/ai-copilot') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
              🤖 AI HR Copilot
            </Link>
            {(userRole === 'SYSTEM_ADMIN' || userRole === 'TENANT_ADMIN') && (
              <Link href="/marketplace" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/marketplace') ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)]'}`}>
                🛍️ Integration Apps
              </Link>
            )}
          </nav>

          <div className="p-3 border-t border-[var(--border-subtle)]">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" /> Exit Workspace
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE CANVAS */}
        <main ref={mainContentRef} className="main-content flex-1 overflow-y-auto p-6 bg-[var(--bg-primary)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
