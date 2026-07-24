'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '../../services/api';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tenantName, setTenantName] = useState('Workspace');
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <div className="sidebar-header">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="sidebar-logo" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="sidebar-logo">
              {tenantName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="sidebar-title">{tenantName}</span>
        </div>

        <nav className="sidebar-nav">
          <Link 
            href="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/org-chart" 
            className={`nav-link ${isActive('/org-chart') ? 'nav-link-active' : ''}`}
          >
            Org Chart
          </Link>
          <Link 
            href="/lifecycle" 
            className={`nav-link ${isActive('/lifecycle') ? 'nav-link-active' : ''}`}
          >
            Milestones & Clearance
          </Link>
          <Link 
            href="/ess" 
            className={`nav-link ${isActive('/ess') ? 'nav-link-active' : ''}`}
          >
            My ESS Portal
          </Link>
          <Link 
            href="/mss" 
            className={`nav-link ${isActive('/mss') ? 'nav-link-active' : ''}`}
          >
            Team MSS Portal
          </Link>
          <Link 
            href="/approvals" 
            className={`nav-link ${isActive('/approvals') ? 'nav-link-active' : ''}`}
          >
            📥 Approvals Inbox
          </Link>
          <Link 
            href="/recruitment" 
            className={`nav-link ${isActive('/recruitment') ? 'nav-link-active' : ''}`}
          >
            Recruitment ATS
          </Link>
          <Link 
            href="/onboarding" 
            className={`nav-link ${isActive('/onboarding') ? 'nav-link-active' : ''}`}
          >
            Onboarding
          </Link>
          <Link 
            href="/suite" 
            className={`nav-link ${isActive('/suite') ? 'nav-link-active' : ''}`}
          >
            Enterprise HR Suite
          </Link>
          <Link 
            href="/profile" 
            className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}
          >
            My Profile
          </Link>
          <Link 
            href="/leaves" 
            className={`nav-link ${isActive('/leaves') ? 'nav-link-active' : ''}`}
          >
            Vacation Control
          </Link>
          <Link 
            href="/shifts" 
            className={`nav-link ${isActive('/shifts') ? 'nav-link-active' : ''}`}
          >
            Shift Schedule
          </Link>
          <Link 
            href="/offboarding" 
            className={`nav-link ${isActive('/offboarding') ? 'nav-link-active' : ''}`}
          >
            Offboarding Clearance
          </Link>
          <Link 
            href="/holidays" 
            className={`nav-link ${isActive('/holidays') ? 'nav-link-active' : ''}`}
          >
            🏖️ Holidays
          </Link>
          <Link 
            href="/payroll" 
            className={`nav-link ${isActive('/payroll') ? 'nav-link-active' : ''}`}
          >
            💰 Payroll Engine
          </Link>
          <Link 
            href="/performance" 
            className={`nav-link ${isActive('/performance') ? 'nav-link-active' : ''}`}
          >
            📈 Performance
          </Link>
          <Link 
            href="/learning" 
            className={`nav-link ${isActive('/learning') ? 'nav-link-active' : ''}`}
          >
            🎓 Learning (LMS)
          </Link>
          <Link 
            href="/assets" 
            className={`nav-link ${isActive('/assets') ? 'nav-link-active' : ''}`}
          >
            📦 Asset Management
          </Link>
          <Link 
            href="/succession" 
            className={`nav-link ${isActive('/succession') ? 'nav-link-active' : ''}`}
          >
            📋 Succession Planning
          </Link>
          <Link 
            href="/compensation" 
            className={`nav-link ${isActive('/compensation') ? 'nav-link-active' : ''}`}
          >
            💸 Compensation
          </Link>
          <Link 
            href="/benefits" 
            className={`nav-link ${isActive('/benefits') ? 'nav-link-active' : ''}`}
          >
            🏥 Benefits Admin
          </Link>
          <Link 
            href="/workforce" 
            className={`nav-link ${isActive('/workforce') ? 'nav-link-active' : ''}`}
          >
            📅 Workforce Scheduling
          </Link>
          <Link 
            href="/contractor" 
            className={`nav-link ${isActive('/contractor') ? 'nav-link-active' : ''}`}
          >
            👷 Contractor Management
          </Link>
          <Link 
            href="/visitors" 
            className={`nav-link ${isActive('/visitors') ? 'nav-link-active' : ''}`}
          >
            🪪 Visitor Management
          </Link>
          <Link 
            href="/compliance-management" 
            className={`nav-link ${isActive('/compliance-management') ? 'nav-link-active' : ''}`}
          >
            ⚖️ Compliance & Audits
          </Link>
          <Link 
            href="/health-safety" 
            className={`nav-link ${isActive('/health-safety') ? 'nav-link-active' : ''}`}
          >
            🦺 Health & Safety
          </Link>
          <Link 
            href="/engagement" 
            className={`nav-link ${isActive('/engagement') ? 'nav-link-active' : ''}`}
          >
            🎉 Engagement & Recognition
          </Link>
          <Link 
            href="/career-development" 
            className={`nav-link ${isActive('/career-development') ? 'nav-link-active' : ''}`}
          >
            🚀 Career Development
          </Link>
          <Link 
            href="/analytics" 
            className={`nav-link ${isActive('/analytics') ? 'nav-link-active' : ''}`}
          >
            📊 Workforce Analytics
          </Link>
          <Link 
            href="/knowledge-management" 
            className={`nav-link ${isActive('/knowledge-management') ? 'nav-link-active' : ''}`}
          >
            📚 Knowledge Base
          </Link>
          <Link 
            href="/internal-communication" 
            className={`nav-link ${isActive('/internal-communication') ? 'nav-link-active' : ''}`}
          >
            💬 Internal Communication
          </Link>
          <Link 
            href="/search" 
            className={`nav-link ${isActive('/search') ? 'nav-link-active' : ''}`}
          >
            🔍 Enterprise Search
          </Link>
          <Link 
            href="/data-migration" 
            className={`nav-link ${isActive('/data-migration') ? 'nav-link-active' : ''}`}
          >
            🔄 Data Migration
          </Link>
          <Link 
            href="/api-marketplace" 
            className={`nav-link ${isActive('/api-marketplace') ? 'nav-link-active' : ''}`}
          >
            🔌 API Marketplace
          </Link>
          <Link 
            href="/developer-platform" 
            className={`nav-link ${isActive('/developer-platform') ? 'nav-link-active' : ''}`}
          >
            💻 Developer Platform
          </Link>
          <Link 
            href="/marketplace" 
            className={`nav-link ${isActive('/marketplace') ? 'nav-link-active' : ''}`}
          >
            🛍️ Integration Marketplace
          </Link>
          <Link 
            href="/localization" 
            className={`nav-link ${isActive('/localization') ? 'nav-link-active' : ''}`}
          >
            🌐 Localization
          </Link>
          <Link 
            href="/accessibility" 
            className={`nav-link ${isActive('/accessibility') ? 'nav-link-active' : ''}`}
          >
            ♿ Accessibility
          </Link>
          <Link 
            href="/business-continuity" 
            className={`nav-link ${isActive('/business-continuity') ? 'nav-link-active' : ''}`}
          >
            🛡️ Business Continuity
          </Link>
          <Link 
            href="/platform-operations" 
            className={`nav-link ${isActive('/platform-operations') ? 'nav-link-active' : ''}`}
          >
            ⚙️ Platform Operations
          </Link>
          <Link 
            href="/ai-copilot" 
            className={`nav-link ${isActive('/ai-copilot') ? 'nav-link-active' : ''}`}
          >
            🤖 AI Copilot
          </Link>
          <Link 
            href="/mobile-enterprise" 
            className={`nav-link ${isActive('/mobile-enterprise') ? 'nav-link-active' : ''}`}
          >
            📱 Mobile Enterprise
          </Link>
          <Link 
            href="/enterprise-admin" 
            className={`nav-link ${isActive('/enterprise-admin') ? 'nav-link-active' : ''}`}
          >
            👑 Enterprise Admin
          </Link>
          <Link 
            href="/settings/billing" 
            className={`nav-link ${isActive('/settings/billing') ? 'nav-link-active' : ''}`}
          >
            💳 Subscription & Billing
          </Link>
          <Link 
            href="/superadmin/tenants" 
            className={`nav-link ${isActive('/superadmin/tenants') ? 'nav-link-active' : ''}`}
          >
            🛡️ Super Admin Control
          </Link>
          <Link 
            href="/superadmin/analytics" 
            className={`nav-link ${isActive('/superadmin/analytics') ? 'nav-link-active' : ''}`}
          >
            📈 SaaS Tenant Analytics
          </Link>
          <Link 
            href="/settings/sso" 
            className={`nav-link ${isActive('/settings/sso') ? 'nav-link-active' : ''}`}
          >
            🔐 SSO & SAML Auth
          </Link>
          <Link 
            href="/approvals" 
            className={`nav-link ${isActive('/approvals') ? 'nav-link-active' : ''}`}
          >
            📥 Approvals Inbox
          </Link>
          <Link 
            href="/employees/profile-360" 
            className={`nav-link ${isActive('/employees/profile-360') ? 'nav-link-active' : ''}`}
          >
            👤 Employee 360
          </Link>
          <Link 
            href="/settings/salary-structures" 
            className={`nav-link ${isActive('/settings/salary-structures') ? 'nav-link-active' : ''}`}
          >
            💵 Salary Structure
          </Link>
          <Link 
            href="/settings/notifications" 
            className={`nav-link ${isActive('/settings/notifications') ? 'nav-link-active' : ''}`}
          >
            🔔 Smart Notifications
          </Link>
          <Link 
            href="/payroll/bank-export" 
            className={`nav-link ${isActive('/payroll/bank-export') ? 'nav-link-active' : ''}`}
          >
            🏦 Bank Payroll Export
          </Link>
          <Link 
            href="/recruitment/interviews" 
            className={`nav-link ${isActive('/recruitment/interviews') ? 'nav-link-active' : ''}`}
          >
            📅 Interviews & Offers
          </Link>
          <Link 
            href="/audit" 
            className={`nav-link ${isActive('/audit') ? 'nav-link-active' : ''}`}
          >
            📋 Audit Center
          </Link>
          <Link 
            href="/settings" 
            className={`nav-link ${isActive('/settings') ? 'nav-link-active' : ''}`}
          >
            Branding Settings
          </Link>
          <Link 
            href="/roles" 
            className={`nav-link ${isActive('/roles') ? 'nav-link-active' : ''}`}
          >
            Roles & Permissions
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="nav-link" 
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '12px 16px' }}
          >
            Exit Workspace
          </button>
        </div>
      </aside>

      <main className="main-content">
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="register-module__1w8EXG__spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
