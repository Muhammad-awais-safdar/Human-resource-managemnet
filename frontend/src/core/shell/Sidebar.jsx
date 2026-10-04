import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Network,
  ShieldCheck,
  CreditCard,
  CheckSquare,
  Briefcase,
  UserCheck,
  Calendar,
  Receipt,
  Award,
  Settings,
  Building2,
  BarChart3,
} from 'lucide-react';

export function Sidebar({ collapsed }) {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Org Chart', path: '/org-chart', icon: Network },
    { label: 'Roles & RBAC', path: '/roles', icon: ShieldCheck },
    { label: 'Payroll Engine', path: '/payroll', icon: CreditCard },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare },
    { label: 'Recruitment', path: '/recruitment', icon: Briefcase },
    { label: 'Self Service (ESS)', path: '/ess', icon: UserCheck },
    { label: 'Leaves & Time-Off', path: '/leaves', icon: Calendar },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Performance', path: '/performance', icon: Award },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Tenants', path: '/tenants', icon: Building2 },
    { label: 'Platform Analytics', path: '/superadmin/analytics', icon: BarChart3 },
  ];

  return (
    <aside
      className={`sidebar border-r border-slate-200 bg-white flex flex-col justify-between py-4 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="space-y-1 px-3">
        {!collapsed && (
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
