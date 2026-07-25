'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import apiClient from '../../services/api';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tenantName, setTenantName] = useState('Workspace');
  const [logoUrl, setLogoUrl] = useState('');
  const [userRole, setUserRole] = useState('TENANT_ADMIN');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const sidebarNavRef = useRef(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          const r = parsed.role || (parsed.roles ? parsed.roles.split(',')[0] : 'TENANT_ADMIN');
          setUserRole(r.toUpperCase());
          setUserName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.email || '');
        } catch (e) {}
      }
    }
  }, []);

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
    // Dynamically retrieve active tenant branding info from backend
    apiClient.get('/tenants/active')
      .then((res) => {
        if (res.success) {
          setTenantName(res.name);
          setLogoUrl(res.logoUrl);
          
          // Inject HSL/Hex brand colors directly into document styling tokens
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

  if (!mounted) {
    return <div suppressHydrationWarning={true} style={{ backgroundColor: '#09090b', minHeight: '100vh' }} />;
  }

  return (
    <div suppressHydrationWarning={true} className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="sidebar-logo" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="sidebar-logo">
                {tenantName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span className="sidebar-title" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{tenantName}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{userName || 'User Session'}</span>
            </div>
          </div>

          <div style={{ marginTop: '4px', width: '100%' }}>
            {userRole === 'SYSTEM_ADMIN' && (
              <span className="sidebar-role-badge system-admin">
                👑 SaaS Product Owner
              </span>
            )}
            {userRole === 'TENANT_ADMIN' && (
              <span className="sidebar-role-badge tenant-admin">
                🏢 Tenant Administrator
              </span>
            )}
            {userRole === 'HR_MANAGER' && (
              <span className="sidebar-role-badge hr-manager">
                👔 HR Department Manager
              </span>
            )}
            {userRole === 'EMPLOYEE' && (
              <span className="sidebar-role-badge employee">
                👤 Employee Self-Service
              </span>
            )}
          </div>
        </div>

        <nav ref={sidebarNavRef} className="sidebar-nav">
          <div className="nav-section-label">MAIN DASHBOARD</div>
          <Link 
            href="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
          >
            📊 {userRole === 'SYSTEM_ADMIN' ? 'SaaS Super Admin Dashboard' : (userRole === 'TENANT_ADMIN' || userRole === 'HR_MANAGER') ? 'Tenant Org Dashboard' : 'Employee ESS Dashboard'}
          </Link>

          {/* 1. SAAS PLATFORM CONTROL (SYSTEM_ADMIN ONLY) */}
          {userRole === 'SYSTEM_ADMIN' && (
            <>
              <div className="nav-section-label" style={{ marginTop: '16px', color: '#eab308' }}>👑 SAAS PLATFORM CONTROL</div>
              <Link href="/superadmin/analytics" className={`nav-link ${isActive('/superadmin/analytics') ? 'nav-link-active' : ''}`}>
                📈 SaaS Tenant Analytics
              </Link>
              <Link href="/tenants" className={`nav-link ${isActive('/tenants') ? 'nav-link-active' : ''}`}>
                🏢 Enterprise Tenant Provisioning
              </Link>
              <Link href="/superadmin/tenants" className={`nav-link ${isActive('/superadmin/tenants') ? 'nav-link-active' : ''}`}>
                🛡️ Super Admin Control
              </Link>
              <Link href="/platform-operations" className={`nav-link ${isActive('/platform-operations') ? 'nav-link-active' : ''}`}>
                ⚙️ Platform Operations
              </Link>
              <Link href="/business-continuity" className={`nav-link ${isActive('/business-continuity') ? 'nav-link-active' : ''}`}>
                🛡️ Business Continuity & Failover
              </Link>
              <Link href="/audit" className={`nav-link ${isActive('/audit') ? 'nav-link-active' : ''}`}>
                📋 Global Security Audit Ledger
              </Link>
              <Link href="/logs" className={`nav-link ${isActive('/logs') ? 'nav-link-active' : ''}`}>
                📊 Platform & Security Logs
              </Link>
              <Link href="/data-migration" className={`nav-link ${isActive('/data-migration') ? 'nav-link-active' : ''}`}>
                🔄 Multi-Tenant Data Migration
              </Link>
              <Link href="/api-marketplace" className={`nav-link ${isActive('/api-marketplace') ? 'nav-link-active' : ''}`}>
                🔌 API Marketplace
              </Link>
              <Link href="/developer-platform" className={`nav-link ${isActive('/developer-platform') ? 'nav-link-active' : ''}`}>
                💻 Developer Platform
              </Link>
            </>
          )}

          {/* 2. TENANT ORGANIZATION ADMINISTRATION (TENANT_ADMIN & HR_MANAGER) */}
          {(userRole === 'TENANT_ADMIN' || userRole === 'HR_MANAGER') && (
            <>
              <div className="nav-section-label" style={{ marginTop: '16px', color: '#6366f1' }}>🏢 ORGANIZATION ADMINISTRATION</div>
              <Link href="/org-chart" className={`nav-link ${isActive('/org-chart') ? 'nav-link-active' : ''}`}>
                🏢 Org Chart & Hierarchy
              </Link>
              {userRole === 'TENANT_ADMIN' && (
                <>
                  <Link href="/settings" className={`nav-link ${isActive('/settings') ? 'nav-link-active' : ''}`}>
                    🎨 Workspace White-labeling
                  </Link>
                  <Link href="/roles" className={`nav-link ${isActive('/roles') ? 'nav-link-active' : ''}`}>
                    🔐 Roles & Security Matrix
                  </Link>
                </>
              )}
              <Link href="/payroll" className={`nav-link ${isActive('/payroll') ? 'nav-link-active' : ''}`}>
                💰 Payroll Calculation Engine
              </Link>
              <Link href="/payroll/bank-export" className={`nav-link ${isActive('/payroll/bank-export') ? 'nav-link-active' : ''}`}>
                🏦 Bank Payroll Export
              </Link>
              <Link href="/approvals" className={`nav-link ${isActive('/approvals') ? 'nav-link-active' : ''}`}>
                📥 Approvals Control Center
              </Link>
              <Link href="/recruitment" className={`nav-link ${isActive('/recruitment') ? 'nav-link-active' : ''}`}>
                💼 Recruitment & ATS
              </Link>
              <Link href="/lifecycle" className={`nav-link ${isActive('/lifecycle') ? 'nav-link-active' : ''}`}>
                📋 Milestones & Clearance
              </Link>
              <Link href="/assets" className={`nav-link ${isActive('/assets') ? 'nav-link-active' : ''}`}>
                📦 Corporate Asset Management
              </Link>
              <Link href="/compliance-management" className={`nav-link ${isActive('/compliance-management') ? 'nav-link-active' : ''}`}>
                ⚖️ Compliance & Audits
              </Link>

              <div className="nav-section-label" style={{ marginTop: '16px', color: '#38bdf8' }}>👥 MANAGER PORTAL</div>
              <Link href="/mss" className={`nav-link ${isActive('/mss') ? 'nav-link-active' : ''}`}>
                👥 Team MSS Portal
              </Link>
            </>
          )}

          {/* 3. RECRUITER ATS NAVIGATION */}
          {userRole === 'RECRUITER' && (
            <>
              <div className="nav-section-label" style={{ marginTop: '16px', color: '#a855f7' }}>💼 TALENT ACQUISITION</div>
              <Link href="/recruitment" className={`nav-link ${isActive('/recruitment') ? 'nav-link-active' : ''}`}>
                💼 Recruitment & ATS
              </Link>
              <Link href="/lifecycle" className={`nav-link ${isActive('/lifecycle') ? 'nav-link-active' : ''}`}>
                📋 Candidate Milestones
              </Link>
            </>
          )}

          {/* 4. EMPLOYEE SELF-SERVICE (EMPLOYEE, HR_MANAGER & TENANT_ADMIN) */}
          {(userRole === 'EMPLOYEE' || userRole === 'HR_MANAGER' || userRole === 'TENANT_ADMIN') && (
            <>
              <div className="nav-section-label" style={{ marginTop: '16px', color: '#10b981' }}>👤 WORKFORCE & SELF-SERVICE</div>
              <Link href="/ess" className={`nav-link ${isActive('/ess') ? 'nav-link-active' : ''}`}>
                👤 My ESS Portal
              </Link>
              <Link href="/leaves" className={`nav-link ${isActive('/leaves') ? 'nav-link-active' : ''}`}>
                🏖️ Vacation & Leave Requests
              </Link>
              <Link href="/expenses" className={`nav-link ${isActive('/expenses') ? 'nav-link-active' : ''}`}>
                💼 Expense Claims & Reimbursements
              </Link>
              <Link href="/shifts" className={`nav-link ${isActive('/shifts') ? 'nav-link-active' : ''}`}>
                📅 Shift Schedule
              </Link>
              <Link href="/learning" className={`nav-link ${isActive('/learning') ? 'nav-link-active' : ''}`}>
                🎓 Learning & LMS
              </Link>
              <Link href="/performance" className={`nav-link ${isActive('/performance') ? 'nav-link-active' : ''}`}>
                📈 Performance Reviews
              </Link>
            </>
          )}

          {/* 5. SYSTEM UTILITIES (ALL ROLES) */}
          <div className="nav-section-label" style={{ marginTop: '16px' }}>⚙️ SYSTEM UTILITIES</div>
          <Link href="/profile" className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}>
            👤 My Account Profile
          </Link>
          <Link href="/ai-copilot" className={`nav-link ${isActive('/ai-copilot') ? 'nav-link-active' : ''}`}>
            🤖 AI HR Copilot
          </Link>
          {(userRole === 'SYSTEM_ADMIN' || userRole === 'TENANT_ADMIN') && (
            <Link href="/marketplace" className={`nav-link ${isActive('/marketplace') ? 'nav-link-active' : ''}`}>
              🛍️ Integration Apps
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="nav-link" 
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '12px 16px' }}
          >
            🚪 Exit Workspace
          </button>
        </div>
      </aside>

      <main ref={mainContentRef} className="main-content">
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="register-module__1w8EXG__spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
