# 12 — Executive Dashboard UX Architecture & Role-Based Layouts

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Dashboard Designers, Frontend Engineers, Data Visualization Specialists
- **Cross-References**: `03_Design_Principles.md`, `10_Layout_System.md`, `25_Analytics_UI.md`

---

## 1. Purpose

This document specifies the dashboard user experience for Awais HR. It covers executive stat widgets, responsive grid layouts, role-based dashboard variants (`SYSTEM_ADMIN`, `TENANT_ADMIN`, `HR_MANAGER`, `EMPLOYEE`), and chart display standards using Recharts.

---

## 2. Executive Overview

Dashboards serve as the operational command center for enterprise users. Awais HR avoids generic empty placeholder cards by enforcing a data-rich metric hierarchy. Each dashboard variant delivers immediate actionable intelligence, featuring mini sparklines, trend percentage indicators, quick action triggers, and real-time status feeds.

---

## 3. Detailed Specifications

### 3.1 Role-Based Dashboard View Specifications

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ROLE-BASED DASHBOARD TAXONOMY                        │
├───────────────────┬────────────────────────────────────────────────────┤
│ USER ROLE         │ PRIMARY DASHBOARD WIDGETS & INTENT                 │
├───────────────────┼────────────────────────────────────────────────────┤
│ SYSTEM_ADMIN      │ Tenant count, Hikari pool status, MRR/ARR charts,  │
│ (SaaS SuperAdmin) │ platform error logs, tenant provisioning triggers  │
├───────────────────┼────────────────────────────────────────────────────┤
│ TENANT_ADMIN      │ Org headcount breakdown, payroll variance metrics, │
│ (Company Admin)   │ compliance alert ledger, active cost centers       │
├───────────────────┼────────────────────────────────────────────────────┤
│ HR_MANAGER        │ Today's attendance %, pending leave approvals,    │
│ (HR Ops Lead)     │ active ATS requisitions, upcoming onboarding tasks │
├───────────────────┼────────────────────────────────────────────────────┤
│ EMPLOYEE          │ Vacation balance gauge, shift clock-in widget,     │
│ (ESS Portal)      │ pending requests status, company announcements     │
└───────────────────┴────────────────────────────────────────────────────┘
```

### 3.2 Stat Widget Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STAT CARD ANATOMY                               │
├────────────────────────────────────────────────────────────────────────┤
│ [Icon Badge]  TITLE LABEL (e.g. Total Active Headcount)   [Option Menu]│
│                                                                        │
│ 1,482 Employees    [ +8.4% vs last month ] (Green Success Badge)       │
│                                                                        │
│ 📈 [ Mini SVG Sparkline Chart / Trend Line ]                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Role-Gated Dashboards**: When a user logs in, their JWT role token immediately renders their corresponding dashboard architecture, eliminating unnecessary API calls for unauthorized analytics.
- **Micro Sparkline Data Visualization**: Every key stat card features a 7-day trend sparkline chart, enabling instant pattern recognition without navigating to full analytics pages.

---

## 5. Examples & Implementation Contracts

```jsx
// Enterprise Stat Widget Component Contract
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export function StatWidget({ title, value, change, isPositive, sparklineData, icon: Icon, accentColor = 'indigo' }) {
  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover:border-[var(--border-strong)] transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-l2)] text-[var(--accent-primary)]">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{title}</span>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{value}</div>
        <div className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
          {change}
        </div>
      </div>

      {sparklineData && (
        <div className="h-10 mt-3 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Best Practices

- **Skeleton Loaders for All Widgets**: Stat cards must render clean skeleton placeholders matching their exact height during data fetching.
- **Keep Sparklines Minimal**: Remove grid lines, axes, and legends from inline stat sparklines to maintain visual clarity.

---

## 7. Future Considerations

- **Custom Drag-and-Drop Dashboard Builder**: Allowing tenant admins to customize widget placement and save layout preferences.
