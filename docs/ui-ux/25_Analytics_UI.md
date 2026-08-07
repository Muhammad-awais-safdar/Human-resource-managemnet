# 25 — Advanced Analytics, Reports & Data Export UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Data UX Designers, Frontend Chart Engineers, BI Specialists
- **Cross-References**: `04_Color_System.md`, `12_Dashboard_UX.md`, `14_Table_Standards.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Analytics & Custom Report Builder Module. It specifies charting standards using Recharts, custom report query filters, PDF/CSV/Excel export triggers, and scheduled report dispatch options.

---

## 2. Executive Overview

Executive HR leaders require data visualization to analyze headcount growth, turnover rates, payroll expenses, and recruitment pipeline velocity. Awais HR provides interactive Recharts visualizations, custom report query builders, export features, and automated email scheduled dispatches.

---

## 3. Detailed Specifications

### 3.1 Analytics Dashboard Visual Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ ADVANCED HR WORKFORCE ANALYTICS                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Date Range: Year-to-Date 📅]  [Department: All]  [Export Report ⬇️]  │
├───────────────────────────────────────┬────────────────────────────────┤
│ HEADCOUNT GROWTH TREND (Area Chart)   │ TURNOVER BY DEPT (Bar Chart)   │
│ 📈 1,200 ───.---.---.                 │ 📊 Engineering: 4.2%           │
│           /     \   \                 │ 📊 Sales:       8.1%           │
│ 📈   800 /       `---`                │ 📊 Marketing:   2.5%           │
├───────────────────────────────────────┴────────────────────────────────┤
│ CUSTOM REPORT BUILDER QUERY MATRIX                                     │
│ SELECT [ Columns ] WHERE [ Conditions ] GROUP BY [ Department ]        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Recharts Chart Color Contract
- **Primary Data Series**: `#6366f1` (Indigo)
- **Secondary Data Series**: `#a855f7` (Purple)
- **Success Series**: `#10b981` (Emerald)
- **Warning Series**: `#f59e0b` (Amber)
- **Chart Gridlines**: `stroke="rgba(255,255,255,0.07)"`

---

## 4. Design Decisions & Rationale

- **Interactive Tooltips**: Chart hover tooltips render glassmorphic cards with tabular formatted numbers and percentage comparisons.
- **Client-Side Export Acceleration**: Small report exports process immediately in browser memory, while large datasets trigger an asynchronous background worker notification toast.

---

## 5. Examples & Implementation Contracts

```jsx
// Enterprise Recharts Area Chart Component Contract
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function AnalyticsTrendChart({ data, xKey = 'month', yKey = 'headcount' }) {
  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-5 h-80 w-full">
      <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4">Workforce Headcount Growth Trend</h4>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" fontSize={11} />
          <YAxis stroke="var(--text-secondary)" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: '#1a1a22', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px' }} />
          <Area type="monotone" dataKey={yKey} stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorPrimary)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 6. Best Practices

- **Never Overcrowd Charts**: Limit line/area charts to a maximum of 4 simultaneous data series.
- **Include Empty State Placeholders**: When a date range filter yields zero data points, display a clean empty state card with filter adjustment suggestions.

---

## 7. Future Considerations

- **AI Natural Language Report Generator**: Allowing executives to type *"Show me Q3 engineering salary distribution"* to generate instant custom charts.
