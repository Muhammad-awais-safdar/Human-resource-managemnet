# 02 — Next.js 16 App Router Strategy & Route Hierarchy

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Next.js Engineers, Frontend Architects, Security Engineers
- **Design System Cross-Reference**: `docs/ui-ux/34_Information_Architecture.md`

---

## 1. Purpose

This document details the route architecture, App Router route grouping, dynamic URL parameters, middleware guards, and deep-linking strategies for **Awais HR** using Next.js 16.

---

## 2. Scope

This specification governs all URL route definitions, route authorization guards, server-side redirects, and query string state management across unauthenticated and authenticated app sections.

---

## 3. Standards & Routing Guidelines

### 3.1 App Router Route Grouping Standard
- `(auth)`: Unauthenticated routes (Login, Password Reset, 2FA Verification) using a minimal centered card layout.
- `(dashboard)`: Authenticated enterprise routes wrapped inside the persistent Application Layout Shell.
- `(superadmin)`: SaaS SuperAdmin control panel routes accessible exclusively by `SYSTEM_ADMIN` roles.

### 3.2 Deep Linking & Query Parameter Standard
Drawers, active tabs, filter query strings, and pagination parameters must be reflected directly in URL query parameters (e.g. `/employees?page=2&dept=engineering&drawer=usr-9402`), enabling shareable deep-linked URLs across teams.

---

## 4. Folder Structure & Route Hierarchy

```
src/app/
├── (auth)/                         # Auth Route Group (Unauthenticated)
│   ├── login/page.tsx              # /login
│   ├── register/page.tsx           # /register
│   └── reset-password/page.tsx     # /reset-password
├── (dashboard)/                    # Authenticated Main App Shell
│   ├── layout.tsx                  # Persistent Application Layout Shell
│   ├── dashboard/page.tsx          # /dashboard
│   ├── employees/                  # Employee Management
│   │   ├── page.tsx                # /employees (Directory)
│   │   └── [id]/page.tsx           # /employees/usr-9402 (Full Page Profile)
│   ├── attendance/page.tsx         # /attendance
│   ├── leaves/page.tsx             # /leaves
│   ├── payroll/                    # Payroll Module
│   │   ├── page.tsx                # /payroll (Overview & Wizard)
│   │   └── runs/[runId]/page.tsx   # /payroll/runs/pay-9021 (Run Detail)
│   ├── recruitment/page.tsx        # /recruitment (ATS Kanban)
│   ├── performance/page.tsx        # /performance
│   ├── analytics/page.tsx          # /analytics
│   └── settings/page.tsx           # /settings (Tenant White-Label Settings)
├── middleware.ts                   # Edge Auth & Subdomain Routing Guard
└── layout.tsx                      # Root HTML Shell & Context Providers
```

---

## 5. Naming Conventions

- **Route Folder Names**: Lowercase kebab-case (e.g. `reset-password/`, `org-chart/`).
- **Dynamic Route Folders**: Wrapped in square brackets (e.g. `[id]/`, `[runId]/`).
- **Route Group Folders**: Wrapped in parentheses (e.g. `(auth)/`, `(dashboard)/`).

---

## 6. Implementation Code Contracts

```typescript
// Edge Authorization Middleware Contract (src/middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('awais_auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/employees');

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 7. Best Practices

- **Never Hardcode Links**: Use typed constants or routing helper utilities to construct dynamic URL strings.
- **Use `useSearchParams` for Transient State**: Mirror modal states and table filters in query search params.
- **Handle Loading & Error States per Route**: Define `loading.tsx` and `error.tsx` inside each route folder for granular React Suspense streaming.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** leverage parallel routes (`@modal`, `@drawer`) for overlay drawers where applicable.
- **DO** use `router.push(..., { scroll: false })` when updating query parameters to avoid scrolling page to top.

### Don'ts
- **DON'T** use client-side redirects inside components when middleware can handle redirects at the network edge.
- **DON'T** create deeply nested routes without corresponding business logic requirements.

---

## 9. Dependencies Reference

- `next/navigation`: `useRouter`, `usePathname`, `useSearchParams`
- `next/server`: `NextResponse`, `NextRequest`

---

## 10. Implementation Notes

All main dashboard routes inside `(dashboard)/` share `src/app/(dashboard)/layout.tsx`, ensuring the left navigation sidebar, top command header, and WebSocket notification providers remain mounted across client transitions.
