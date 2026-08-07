# 17 — Error Handling: React Error Boundaries & API Exception Mapping

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Quality Engineers, Frontend Architects, Resilience Leads
- **Design System Cross-Reference**: `docs/ui-ux/32_Empty_Loading_Error_States.md`

---

## 1. Purpose

This document details the frontend error handling strategy for **Awais HR**. It covers React Error Boundaries, Next.js `error.tsx` route handlers, API exception mapping, network disconnect indicators, and user-friendly fallback UIs.

---

## 2. Scope

This specification applies to runtime Javascript exceptions, React component crash boundaries, 4xx/5xx HTTP REST errors, and offline network disconnect states.

---

## 3. Standards & Error Mapping Taxonomy

### 3.1 HTTP Error Mapping Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ HTTP ERROR MAPPING MATRIX                                              │
├────────────┬────────────────────────────┬──────────────────────────────┤
│ STATUS CODE│ EXCEPTION TYPE             │ UI FALLBACK ACTION           │
├────────────┼────────────────────────────┼──────────────────────────────┤
│ 400 Bad Req│ ValidationException        │ Render inline form field errs│
│ 401 Unauth │ InvalidTokenException      │ Silent JWT refresh or Login  │
│ 403 Forbid │ InsufficientRightsException│ 403 Forbidden Access Screen  │
│ 404 Not Fnd│ ResourceNotFoundException  │ 404 Entity Not Found Card    │
│ 500 Internal│ DatabaseRoutingException   │ Error Boundary + Retry Button│
└────────────┴────────────────────────────┴──────────────────────────────┘
```

---

## 4. Folder Structure & Error Directory

```
src/
├── app/
│   ├── error.tsx                   # Root App Router Error Boundary
│   ├── global-error.tsx            # Global HTML Crash Boundary
│   └── not-found.tsx               # 404 Page Renderer
├── components/
│   └── shared/
│       ├── ComponentErrorBoundary.tsx # Fine-grained React Error Boundary
│       └── ErrorCardFallback.tsx   # Reusable Error Card Component
└── utils/
    └── handleApiError.ts           # API Exception Parser & Toast Dispatcher
```

---

## 5. Naming Conventions

- **Error Handlers**: `error.tsx`, `ComponentErrorBoundary.tsx`.
- **Parser Function**: `handleApiError.ts`.

---

## 6. Implementation Code Contracts

```typescript
// Component Error Boundary Contract (src/components/shared/ComponentErrorBoundary.tsx)
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React Component Error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[var(--bg-surface-l1)] border border-[var(--accent-danger)]/30 rounded-xl text-center flex flex-col items-center">
          <AlertCircle className="w-8 h-8 text-[var(--accent-danger)] mb-2" />
          <h4 className="font-bold text-sm text-[var(--text-primary)]">
            {this.props.fallbackTitle || 'Failed to render module section'}
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface-l2)] text-xs font-semibold rounded-lg hover:bg-[var(--bg-surface-l3)]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. Best Practices

- **Isolate Module Failures**: Wrap complex individual widgets (e.g., Recharts Analytics, Org Chart Tree) inside `ComponentErrorBoundary` so a crash in one widget does not crash the entire app shell layout.
- **Never Expose Raw Stack Traces**: Hide internal technical stack traces in production builds; display actionable user instructions.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** log runtime exceptions to Sentry or backend observability endpoints.
- **DO** provide clear `[ Retry ]` triggers on network error cards.

### Don'ts
- **DON'T** swallow API exceptions silently without notifying the user or log metrics.
- **DON'T** redirect users to error pages for minor input validation failures.

---

## 9. Dependencies Reference

- Next.js Error Handling (`error.tsx`, `not-found.tsx`)
- `lucide-react`: Error alert icons

---

## 10. Implementation Notes

Network disconnects automatically trigger a persistent top banner alert (`⚠️ Offline Mode — Attempting to Reconnect...`) until internet connectivity is restored.
