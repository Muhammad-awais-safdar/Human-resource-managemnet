# 12 — Data Visualization Engine: Recharts & Dynamic Tooltips

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Data Visualization Engineers, Frontend Architects, BI Specialists
- **Design System Cross-Reference**: `docs/ui-ux/12_Dashboard_UX.md`, `docs/ui-ux/25_Analytics_UI.md`

---

## 1. Purpose

This document specifies the technical architecture for analytics charts, data visualization widgets, and report charts in **Awais HR** using **Recharts**.

---

## 2. Scope

This specification governs all chart types (Area, Line, Bar, Pie, Sparkline) across Executive Dashboards, Analytics Reports, Payroll Summaries, and Attendance Trends.

---

## 3. Standards & Visual Guidelines

### 3.1 Recharts Styling & Color Matrix
- **Primary Area/Line**: `var(--accent-primary)` (`#6366f1`)
- **Secondary Series**: `var(--accent-secondary)` (`#a855f7`)
- **Success Series**: `var(--accent-success)` (`#10b981`)
- **Warning Series**: `var(--accent-warning)` (`#f59e0b`)
- **Gridlines**: `rgba(255, 255, 255, 0.07)`
- **Container Wrapper**: Recharts `<ResponsiveContainer width="100%" height="100%">`

---

## 4. Folder Structure & Chart Directory

```
src/components/data-display/charts/
├── AreaTrendChart.tsx             # Growth Area Chart Wrapper
├── BarComparisonChart.tsx          # Department Comparison Bar Chart
├── MetricSparkline.tsx             # Inline Stat Card Sparkline
├── CustomChartTooltip.tsx          # Glassmorphic Hover Tooltip Card
└── ChartExportToolbar.tsx          # PNG/SVG/CSV Chart Exporter
```

---

## 5. Naming Conventions

- **Chart Components**: PascalCase ending in `Chart` or `Sparkline` (e.g. `AreaTrendChart.tsx`).

---

## 6. Implementation Code Contracts

```typescript
// Recharts Responsive Area Chart Architecture Contract
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface AreaTrendChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function AreaTrendChart({ data, height = 300 }: AreaTrendChartProps) {
  return (
    <div style={{ width: '100%', height }} className="bg-[var(--bg-surface-l1)] p-4 rounded-xl border border-[var(--border-subtle)]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="chartPrimaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} />
          <YAxis stroke="var(--text-secondary)" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a22',
              borderColor: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--accent-primary)"
            fillOpacity={1}
            fill="url(#chartPrimaryGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 7. Best Practices

- **Wrap in ResponsiveContainer**: Always wrap Recharts elements inside `<ResponsiveContainer>` to enable fluid resizing.
- **Keep Sparklines Minimal**: Remove axis lines, tick labels, and legends on micro sparkline widgets.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** use CSS HSL variables for chart strokes to automatically adapt during light/dark theme switching.
- **DO** format tooltip numeric figures using tabular numbers (`tabular-nums`).

### Don'ts
- **DON'T** render more than 4 data series on a single chart to avoid visual noise.
- **DON'T** hardcode chart container pixel widths.

---

## 9. Dependencies Reference

- `recharts`: React SVG data visualization engine

---

## 10. Implementation Notes

Chart components use `useMemo()` to format data series before rendering, avoiding calculation overhead on frame updates.
