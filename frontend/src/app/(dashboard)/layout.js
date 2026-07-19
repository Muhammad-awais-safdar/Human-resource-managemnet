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
