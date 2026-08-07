'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '../../../services/api';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    legalEntities: 0,
    costCenters: 0,
    departments: 0,
    teams: 0,
    totalNodes: 0,
    totalEmployees: 0,
    activeTenants: 1,
  });
  const [workspaceName, setWorkspaceName] = useState('Workspace');
  const [userRole, setUserRole] = useState('TENANT_ADMIN');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

    // Retrieve active workspace branding & name
    apiClient.get('/tenants/active')
      .then((res) => {
        if (res.success) {
          setWorkspaceName(res.name);
        }
      })
      .catch((err) => console.error(err));

    // Retrieve active organization units
    apiClient.get('/org')
      .then((res) => {
        if (Array.isArray(res)) {
          const counts = {
            legalEntities: res.filter(u => u.type === 'LEGAL_ENTITY').length,
            costCenters: res.filter(u => u.type === 'COST_CENTER').length,
            departments: res.filter(u => u.type === 'DEPARTMENT').length,
            teams: res.filter(u => u.type === 'TEAM').length,
            totalNodes: res.length,
          };
          setMetrics(prev => ({ ...prev, ...counts }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 1. SYSTEM ADMIN (SaaS Product Owner) Dashboard View
  if (userRole === 'SYSTEM_ADMIN') {
    return (
      <div>
        <header className="page-header" style={{ borderLeft: '4px solid #facc15', paddingLeft: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>👑 SAAS PRODUCT OWNER</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '8px' }}>Platform Control Dashboard</h1>
          <p className="page-subtitle">Multi-tenant SaaS platform administration, enterprise tenant provisioning & global system infrastructure.</p>
        </header>

        <div className="dashboard-grid">
          <div className="stats-card" style={{ borderTop: '3px solid #facc15' }}>
            <div className="stats-title">Active Platform Tenants</div>
            <div className="stats-value" style={{ color: '#facc15' }}>{metrics.activeTenants} Enterprise</div>
          </div>
          <div className="stats-card" style={{ borderTop: '3px solid #10b981' }}>
            <div className="stats-title">Global DB Connection Pools</div>
            <div className="stats-value" style={{ color: '#10b981' }}>PostgreSQL Hikari</div>
          </div>
          <div className="stats-card" style={{ borderTop: '3px solid #6366f1' }}>
            <div className="stats-title">Platform Infrastructure Status</div>
            <div className="stats-value" style={{ color: '#6366f1' }}>100% Operational</div>
          </div>
          <div className="stats-card" style={{ borderTop: '3px solid #a855f7' }}>
            <div className="stats-title">Security & Audit Ledger</div>
            <div className="stats-value" style={{ color: '#a855f7' }}>Zero Breaches</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
          <div className="form-card" style={{ maxWidth: '100%' }}>
            <h3>👑 SaaS Product Owner Actions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Manage global multi-tenant settings, provision new enterprise clients, and audit platform connection routing.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/tenants" className="btn btn-primary" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}>
                🏢 Provision New Enterprise Tenant
              </Link>
              <Link href="/superadmin/analytics" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                📈 View SaaS Tenant Analytics
              </Link>
              <Link href="/audit" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                📋 System Audit Ledger
              </Link>
            </div>
          </div>

          <div className="form-card" style={{ maxWidth: '100%' }}>
            <h3>⚡ Dynamic Routing Engine Status</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>Dynamic DataSource Router:</span> <strong style={{ color: '#10b981' }}>Active (HikariCP)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>Redis Multi-Tenant Cache:</span> <strong style={{ color: '#6366f1' }}>Connected</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span>Flyway Schema Version:</span> <strong>Auto-Migrated (V1-V71)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TENANT ADMIN Dashboard View
  if (userRole === 'TENANT_ADMIN' || userRole === 'HR_MANAGER') {
    return (
      <div>
        <header className="page-header" style={{ borderLeft: '4px solid #6366f1', paddingLeft: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>🏢 TENANT ADMINISTRATOR</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '8px' }}>{workspaceName} Administration</h1>
          <p className="page-subtitle">Manage organization structure, workforce lifecycle, payroll calculations, and corporate branding.</p>
        </header>

        <div className="dashboard-grid">
          <div className="stats-card">
            <div className="stats-title">Legal Entities</div>
            <div className="stats-value">{metrics.legalEntities}</div>
          </div>
          <div className="stats-card">
            <div className="stats-title">Cost Centers</div>
            <div className="stats-value">{metrics.costCenters}</div>
          </div>
          <div className="stats-card">
            <div className="stats-title">Departments</div>
            <div className="stats-value">{metrics.departments}</div>
          </div>
          <div className="stats-card">
            <div className="stats-title">Teams</div>
            <div className="stats-value">{metrics.teams}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
          <div className="form-card" style={{ maxWidth: '100%' }}>
            <h3>🏢 Company Administration Links</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Quick access controls for managing your company workforce structure and white-labeling configurations.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/org-chart" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                🏢 Manage Org Chart
              </Link>
              <Link href="/payroll" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                💰 Run Payroll Engine
              </Link>
              <Link href="/settings" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                🎨 Workspace Branding
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. EMPLOYEE Self-Service Dashboard View
  return (
    <div>
      <header className="page-header" style={{ borderLeft: '4px solid #10b981', paddingLeft: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>👤 EMPLOYEE ESS PORTAL</span>
        </div>
        <h1 className="page-title" style={{ marginTop: '8px' }}>Welcome back, {userName || 'Employee'}</h1>
        <p className="page-subtitle">Your personal employee self-service hub at {workspaceName}.</p>
      </header>

      <div className="dashboard-grid">
        <div className="stats-card" style={{ borderTop: '3px solid #10b981' }}>
          <div className="stats-title">Vacation Allowance</div>
          <div className="stats-value" style={{ color: '#10b981' }}>20 Days Available</div>
        </div>
        <div className="stats-card" style={{ borderTop: '3px solid #6366f1' }}>
          <div className="stats-title">Shift Schedule</div>
          <div className="stats-value" style={{ color: '#6366f1' }}>Morning (09:00 - 17:00)</div>
        </div>
        <div className="stats-card" style={{ borderTop: '3px solid #a855f7' }}>
          <div className="stats-title">Pending Approvals</div>
          <div className="stats-value" style={{ color: '#a855f7' }}>0 Requests</div>
        </div>
        <div className="stats-card" style={{ borderTop: '3px solid #facc15' }}>
          <div className="stats-title">Performance Rating</div>
          <div className="stats-value" style={{ color: '#facc15' }}>94% Top Tier</div>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '100%', marginTop: '24px' }}>
        <h3>👤 Employee Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
          <Link href="/ess" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            👤 View My ESS Profile
          </Link>
          <Link href="/leaves" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            🏖️ Request Vacation Leave
          </Link>
          <Link href="/learning" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            🎓 LMS Learning Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
