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
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
              {userRole === 'SYSTEM_ADMIN' ? '👑 Platform Super Admin' : '🏢 ' + workspaceName}
            </span>
            <Badge variant="primary" size="sm">Live Session</Badge>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {userName || 'Enterprise Administrator'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
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
      <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            ⚠️
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300">Action Required Overview</h4>
            <p className="text-[11px] text-slate-300">
              2 pending leave approvals, 1 expense claim review, and 3 upcoming employee certification renewals.
            </p>
          </div>
        </div>

        <Link href="/approvals">
          <Button variant="warning" size="sm">
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
          status="primary"
          trend="Active"
          trendDirection="up"
        />
        <StatCard
          title="Cost Centers"
          value={metrics.costCenters}
          subtitle="Financial allocation centers"
          status="success"
          trend="Operational"
          trendDirection="up"
        />
        <StatCard
          title="Departments"
          value={metrics.departments}
          subtitle="Functional divisions"
          status="warning"
          trend="Configured"
          trendDirection="up"
        />
        <StatCard
          title="Active Teams"
          value={metrics.teams}
          subtitle="Operational workgroups"
          status="danger"
          trend="Managed"
          trendDirection="up"
        />
      </div>

      {/* 5. QUICK ACTIONS PANEL */}
      <div data-tour="quick-actions" className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl">
        <h3 className="text-sm font-bold text-white mb-3">⚡ Quick Actions & Workflows</h3>
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
