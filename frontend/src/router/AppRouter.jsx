import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from '@/core/shell/Header';
import { Sidebar } from '@/core/shell/Sidebar';
import { CommandPaletteModal } from '@/core/shell/CommandPaletteModal';

import { LandingPage } from '@/modules/landing';
import {
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  AcceptInvitePage,
} from '@/modules/auth';

import { DashboardPage } from '@/modules/dashboard';
import { EmployeesPage, OrgChartPage } from '@/modules/employees';
import { PayrollPage } from '@/modules/payroll';
import { ApprovalsPage } from '@/modules/approvals';
import { RecruitmentPage } from '@/modules/recruitment';
import { ESSPage, ProfilePage } from '@/modules/self-service';
import { LeavesPage, ExpensesPage } from '@/modules/time-management';
import { PerformancePage } from '@/modules/performance';
import {
  SettingsPage,
  RolesPage,
  TenantsPage,
  SuperAdminAnalyticsPage,
} from '@/modules/administration';

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenCmdPalette={() => setIsCmdPaletteOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>

      <CommandPaletteModal
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
      />
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      {/* Workspace App Shell Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/suite" element={<Navigate to="/dashboard" replace />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/org-chart" element={<OrgChartPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/ess" element={<ESSPage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/superadmin/analytics" element={<SuperAdminAnalyticsPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
