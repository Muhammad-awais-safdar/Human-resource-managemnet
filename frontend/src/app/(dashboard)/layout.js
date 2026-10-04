'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Search, Bell, LogOut, HelpCircle, Sparkles, Menu, X } from 'lucide-react';
import apiClient from '../../services/api';
import { CommandPaletteModal } from '@/components/shell/CommandPaletteModal';
import { NotificationPopover } from '@/components/shell/NotificationPopover';
import { Badge } from '@/components/primitives/Badge';

// Product Tour, Help & Onboarding Modals
import { ProductTourProvider, useProductTour } from '@/context/ProductTourContext';
import { ProductTourModal } from '@/components/tour/ProductTourModal';
import { HelpCenterModal } from '@/components/help/HelpCenterModal';
import { WhatsNewModal } from '@/components/help/WhatsNewModal';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

function LayoutInnerContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tenantName, setTenantName] = useState('Workspace');
  const [logoUrl, setLogoUrl] = useState('');
  const [userRole, setUserRole] = useState('TENANT_ADMIN');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  // Modal triggers
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarNavRef = useRef(null);
  const mainContentRef = useRef(null);

  const { startTour } = useProductTour();

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

  const [activeModules, setActiveModules] = useState([]);
  const [currentIndustry, setCurrentIndustry] = useState('GENERAL');

  useEffect(() => {
    apiClient.get('/tenants/active')
      .then((res) => {
        if (res.success) {
          setTenantName(res.name);
          setLogoUrl(res.logoUrl);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load active tenant branding context", err);
        setIsLoading(false);
      });

    apiClient.get('/tenants/active-modules')
      .then((res) => {
        if (res && res.activeModules) {
          setActiveModules(res.activeModules);
        }
        if (res && res.industryType) {
          setCurrentIndustry(res.industryType);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleIndustryChange = (newIndustry) => {
    setCurrentIndustry(newIndustry);
    apiClient.put('/tenants/current/industry', { industryType: newIndustry })
      .then((res) => {
        if (res && res.activeModules) {
          setActiveModules(res.activeModules);
        }
      })
      .catch((err) => {
        console.error("Failed to switch tenant industry type", err);
      });
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <div suppressHydrationWarning={true} className="dashboard-layout bg-slate-50 text-slate-900 min-h-screen flex flex-col">
      <CommandPaletteModal isOpen={isCmdPaletteOpen} onClose={() => setIsCmdPaletteOpen(false)} />
      <ProductTourModal />
      <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
      <WhatsNewModal isOpen={isWhatsNewOpen} onClose={() => setIsWhatsNewOpen(false)} />
      <OnboardingWizard isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* TOP NAVBAR HEADER */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 sticky top-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div data-tour="header-tenant-switcher" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-7 h-7 rounded-md object-cover border border-slate-200" />
            ) : (
              <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {tenantName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-xs tracking-tight text-slate-900 hidden sm:inline">{tenantName}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Quick Search Command Palette Trigger */}
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition-colors w-48 sm:w-64 justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search modules or actions...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Industry Vertical Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="font-semibold text-[10px] uppercase tracking-wider text-blue-600">Industry:</span>
            <select
              value={currentIndustry}
              onChange={(e) => handleIndustryChange(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 cursor-pointer focus:outline-none pr-1"
            >
              <option value="GENERAL">🏢 General Enterprise</option>
              <option value="HEALTHCARE">🏥 Healthcare & Clinical</option>
              <option value="IT_SERVICES">💻 IT & Tech Services</option>
              <option value="MANUFACTURING">🏭 Manufacturing & Factory</option>
              <option value="HOSPITALITY">🏨 Hospitality & Restaurant</option>
              <option value="AGRICULTURE">🌾 Agritech & Agriculture</option>
              <option value="RETAIL">🛒 Retail & Supermarkets</option>
              <option value="EDUCATION">🎓 Education & Academics</option>
              <option value="CONSTRUCTION">🏗️ Construction & Safety</option>
              <option value="LOGISTICS">🚚 Logistics & Fleet</option>
              <option value="FINANCIAL_SERVICES">🏦 BFSI & Financial Services</option>
              <option value="ALL_ENABLED">⚡ All Modules Enabled</option>
            </select>
          </div>

          {/* Help & Guided Tour Trigger */}
          <button
            type="button"
            data-tour="help-center-button"
            onClick={() => setIsHelpCenterOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Help & Guides"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="hidden xl:inline">Help & Guides</span>
          </button>

          {/* What's New Trigger */}
          <button
            type="button"
            onClick={() => setIsWhatsNewOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="What's New"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline">What's New</span>
          </button>

          {/* Interactive Notification Popover */}
          <NotificationPopover />

          <div className="h-4 w-[1px] bg-slate-200" />

          {/* User Badge */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs border border-blue-200">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-none">{userName || 'User Session'}</span>
              <span className="text-[10px] text-slate-500 leading-none mt-0.5">{userRole}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR NAVIGATION */}
        <aside
          data-tour="sidebar"
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } transition-transform duration-200 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full`}
        >
          <div className="p-4 border-b border-slate-200 space-y-2">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="sidebar-logo w-8 h-8 rounded-md object-cover" />
              ) : (
                <div className="sidebar-logo w-8 h-8 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {tenantName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="sidebar-title text-xs font-bold text-slate-900 truncate">{tenantName}</span>
                <span className="text-[11px] text-slate-500 truncate">{userName || 'Active Workspace'}</span>
              </div>
            </div>

            <div>
              {userRole === 'SYSTEM_ADMIN' && <Badge variant="warning" className="w-full justify-center">SaaS Product Owner</Badge>}
              {userRole === 'TENANT_ADMIN' && <Badge variant="primary" className="w-full justify-center">Tenant Administrator</Badge>}
              {userRole === 'HR_MANAGER' && <Badge variant="info" className="w-full justify-center">HR Department Manager</Badge>}
              {userRole === 'EMPLOYEE' && <Badge variant="neutral" className="w-full justify-center">Employee Self-Service</Badge>}
            </div>
          </div>

          <nav data-tour="sidebar-nav" ref={sidebarNavRef} className="sidebar-nav flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">MAIN DASHBOARD</div>
            <Link 
              href="/dashboard" 
              className={`nav-link flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              📊 {userRole === 'SYSTEM_ADMIN' ? 'SaaS Super Admin Dashboard' : (userRole === 'TENANT_ADMIN' || userRole === 'HR_MANAGER') ? 'Tenant Org Dashboard' : 'Employee ESS Dashboard'}
            </Link>

            {/* 1. SAAS PLATFORM CONTROL (SYSTEM_ADMIN ONLY) */}
            {userRole === 'SYSTEM_ADMIN' && (
              <>
                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">👑 SAAS PLATFORM CONTROL</div>
                <Link href="/superadmin/analytics" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/superadmin/analytics') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>📈 SaaS Tenant Analytics</Link>
                <Link href="/tenants" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/tenants') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>🏢 Tenant Provisioning</Link>
                <Link href="/roles" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/roles') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>🔐 Global Roles & RBAC</Link>
              </>
            )}

            {/* 2. TENANT ORGANIZATION ADMINISTRATION */}
            {(userRole === 'TENANT_ADMIN' || userRole === 'HR_MANAGER') && (
              <>
                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">🏢 ORGANIZATION ADMINISTRATION</div>
                <Link href="/employees" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/employees') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>👥 Employee Directory</Link>
                <Link href="/org-chart" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/org-chart') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>🏢 Org Chart & Hierarchy</Link>
                {userRole === 'TENANT_ADMIN' && (
                  <>
                    <Link href="/settings" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/settings') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>🎨 Workspace Settings</Link>
                    <Link href="/roles" data-tour="roles-permissions-link" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/roles') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>🔐 Roles & Security Matrix</Link>
                  </>
                )}
                <Link href="/payroll" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/payroll') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>💰 Payroll Engine</Link>
                <Link href="/approvals" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/approvals') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>📥 Approvals Control</Link>
                <Link href="/recruitment" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/recruitment') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>💼 Recruitment & ATS</Link>
              </>
            )}

            {/* 3. EMPLOYEE SELF-SERVICE */}
            {(userRole === 'EMPLOYEE' || userRole === 'HR_MANAGER' || userRole === 'TENANT_ADMIN') && (
              <>
                <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">👤 WORKFORCE & SELF-SERVICE</div>
                <Link href="/ess" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/ess') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>👤 My ESS Portal</Link>
                <Link href="/leaves" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/leaves') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>🏖️ Vacation & Leave</Link>
                <Link href="/expenses" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/expenses') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>💼 Expense Claims</Link>
                <Link href="/performance" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/performance') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>📈 Performance Reviews</Link>
              </>
            )}

            {/* SYSTEM UTILITIES */}
            <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">⚙️ SYSTEM UTILITIES</div>
            <Link href="/profile" className={`nav-link flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${isActive('/profile') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>👤 My Account Profile</Link>
            <button 
              type="button" 
              onClick={() => startTour('welcome-overview', true)} 
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-left cursor-pointer"
            >
              🚀 Replay Guided Tour
            </button>
          </nav>

          <div className="p-3 border-t border-slate-200">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" /> Exit Workspace
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE CANVAS */}
        <main ref={mainContentRef} className="main-content flex-1 overflow-y-auto p-6 bg-slate-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
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

export default function DashboardLayout({ children }) {
  return (
    <ProductTourProvider>
      <LayoutInnerContent>{children}</LayoutInnerContent>
    </ProductTourProvider>
  );
}
