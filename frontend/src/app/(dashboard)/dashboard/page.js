'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '../../../services/api';
import { StatCard } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { SetupChecklistWidget } from '@/components/onboarding/SetupChecklistWidget';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useProductTour } from '@/context/ProductTourContext';

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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const { startTour } = useProductTour();

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

    // Auto-trigger welcome tour on first visit
    setTimeout(() => {
      startTour('welcome-overview');
    }, 1200);
  }, [startTour]);

  return (
    <div className="space-y-6">
      <OnboardingWizard isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* 1. WELCOME BANNER */}
      <div className="p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{background:'var(--bg-secondary)',border:'1px solid var(--border-default)',boxShadow:'var(--shadow-xs)'}}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{color:'var(--primary)'}}>
              {userRole === 'SYSTEM_ADMIN' ? '👑 Platform Super Admin' : '🏢 ' + workspaceName}
            </span>
            <Badge variant="primary" size="sm">Live Session</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{color:'var(--text-primary)'}}>
            Welcome back, {userName || 'Enterprise Administrator'}
          </h1>
          <p className="text-xs mt-1 max-w-xl leading-relaxed" style={{color:'var(--text-muted)'}}>
            Here is your live operational overview across workforce, organization hierarchy, payroll, and compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startTour('welcome-overview', true)}
          >
            🚀 Guided Tour
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsOnboardingOpen(true)}
          >
            ✨ Workspace Wizard
          </Button>
        </div>
      </div>

      {/* 2. SETUP CHECKLIST WIDGET */}
      <SetupChecklistWidget onOpenWizard={() => setIsOnboardingOpen(true)} />

      {/* 3. ACTION REQUIRED BAR */}
      <div className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{background:'var(--warning-bg)',border:'1px solid var(--warning-border)'}}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{background:'var(--warning-border)',color:'var(--warning-text)',fontWeight:700}}>
            ⚠️
          </div>
          <div>
            <h4 className="text-xs font-semibold" style={{color:'var(--text-primary)'}}>Action Required Overview</h4>
            <p className="text-[11px]" style={{color:'var(--warning-text)'}}>
              2 pending leave approvals, 1 expense claim review, and 3 upcoming employee certification renewals.
            </p>
          </div>
        </div>

        <Link href="/approvals">
          <Button variant="primary" size="sm">
            Review Approvals
          </Button>
        </Link>
      </div>

      {/* 4. EXECUTIVE KPI CARDS */}
      <div data-tour="dashboard-kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Legal Entities"
          value={metrics.legalEntities}
          subtitle="Registered corporate units"
          status="default"
          trend="Active"
          trendDirection="up"
        />
        <StatCard
          title="Cost Centers"
          value={metrics.costCenters}
          subtitle="Financial allocation centers"
          status="default"
          trend="Operational"
          trendDirection="up"
        />
        <StatCard
          title="Departments"
          value={metrics.departments}
          subtitle="Functional divisions"
          status="default"
          trend="Configured"
          trendDirection="up"
        />
        <StatCard
          title="Active Teams"
          value={metrics.teams}
          subtitle="Operational workgroups"
          status="default"
          trend="Managed"
          trendDirection="up"
        />
      </div>

      {/* 5. QUICK ACTIONS PANEL */}
      <div data-tour="quick-actions" className="p-6 rounded-xl" style={{background:'var(--bg-secondary)',border:'1px solid var(--border-default)',boxShadow:'var(--shadow-xs)'}}>
        <h3 className="text-sm font-semibold mb-3" style={{color:'var(--text-primary)'}}>⚡ Quick Actions & Workflows</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/employees">
            <Button variant="primary" size="sm">
              👥 Employee Directory
            </Button>
          </Link>
          <Link href="/payroll">
            <Button variant="secondary" size="sm">
              💰 Calculate Payroll
            </Button>
          </Link>
          <Link href="/org-chart">
            <Button variant="outline" size="sm">
              🏢 View Org Chart
            </Button>
          </Link>
          <Link href="/roles">
            <Button variant="outline" size="sm">
              🔐 Configure RBAC
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
