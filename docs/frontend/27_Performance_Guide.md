# 27 — Frontend Performance Guide, Bundle Splitting & CLS Auditing

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Performance Architects, Frontend Engineers, Optimization Leads
- **Design System Cross-Reference**: `docs/ui-ux/44_UI_UX_Best_Practices.md`

---

## 1. Purpose

This document specifies performance optimization techniques, bundle code splitting, Web Vitals metrics, image optimization, and rendering efficiency for **Awais HR**.

---

## 2. Scope

This specification governs bundle size optimization, Next.js dynamic imports, font loading, Core Web Vitals targets, and layout shift prevention.

---

## 3. Standards & Core Web Vitals Targets

### 3.1 Web Vitals Target Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ CORE WEB VITALS PRODUCTION TARGETS                                     │
├─────────────────┬─────────────────┬────────────────────────────────────┤
│ METRIC          │ PRODUCTION GOAL │ OPTIMIZATION TECHNIQUE             │
├─────────────────┼─────────────────┼────────────────────────────────────┤
│ LCP (Largest)   │ < 1.2s          │ Server components & Next Image     │
│ FID (Input)     │ < 50ms          │ Offload heavy computations         │
│ CLS (Layout)    │ 0.00            │ Dimensionally matching Skeletons   │
│ FCP (First Paint│ < 0.8s          │ Critical CSS & Font Preloading     │
│ TTFB (Server)   │ < 150ms         │ Edge Middleware & Fast Redis Cache │
└─────────────────┴─────────────────┴────────────────────────────────────┘
```

---

## 4. Folder Structure & Performance Directory

```
frontend/
├── next.config.mjs                 # Next.js Compiler & Bundle Settings
└── src/
    └── utils/
        └── lazyImports.ts          # Lazy Loaded Component Factories
```

---

## 5. Naming Conventions

- **Dynamic Imports**: Uses `next/dynamic` with explicit `loading` fallback indicators.

---

## 6. Implementation Code Contracts

```typescript
// Dynamic Component Import Code Contract (src/utils/lazyImports.ts)
import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/data-display/skeletons/TableSkeleton';

// Heavy Chart Components Lazy Loaded on Demand
export const DynamicRechartsAreaChart = dynamic(
  () => import('@/components/data-display/charts/AreaTrendChart').then((m) => m.AreaTrendChart),
  {
    loading: () => <TableSkeleton rows={4} />,
    ssr: false, // Chart SVG rendering deferred to client
  }
);
```

---

## 7. Best Practices

- **Dynamic Import Heavy Libraries**: Lazy-load heavy third-party libraries (Recharts, Canvas tools, Export engines) using `next/dynamic` to keep initial JavaScript bundle size under 120kb.
- **Optimize Font Delivery**: Use `next/font/google` for Inter and Geist Mono to enable zero-layout-shift font preloading.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** use `next/image` for avatar graphics to enable WebP compression and automatic responsive srcset generation.
- **DO** run `NEXT_ANALYZE=true npm run build` to audit Webpack bundle chunks before releases.

### Don'ts
- **DON'T** import entire third-party libraries (`import * as _ from 'lodash'`); tree-shake specific functions.
- **DON'T** render thousands of un-virtualized DOM nodes in data tables.

---

## 9. Dependencies Reference

- `@next/bundle-analyzer`: Next.js bundle chunk analyzer tool
- `next/font`: Zero-layout-shift font loader engine

---

## 10. Implementation Notes

Components wrapped in `React.memo` verify prop equality cleanly, preventing unnecessary parent re-renders from trickling down into deep table cell trees.
