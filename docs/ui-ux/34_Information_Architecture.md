# 34 — Global Sitemap, Route Hierarchy & Information Architecture

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Information Architects, Next.js Engineers, Product Managers
- **Cross-References**: `10_Layout_System.md`, `11_Navigation_System.md`, `37_Frontend_Architecture.md`

---

## 1. Purpose

This document details the complete Information Architecture (IA) and App Router URL hierarchy for Awais HR across all 20+ modules.

---

## 2. Executive Overview

Awais HR uses Next.js 16 App Router route grouping (`(auth)`, `(dashboard)`) to organize modules. URLs are semantic, predictable, and REST-aligned, ensuring consistent deep-linking and breadcrumb generation.

---

## 3. Detailed Specifications

### 3.1 Global Route Hierarchy Taxonomy

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── reset-password/
├── (dashboard)/
│   ├── dashboard/                  # Main Executive Overview
│   ├── employees/                  # Directory & Profiles
│   │   └── [id]/                   # Individual Employee Inspector
│   ├── org-chart/                  # Interactive Tree View
│   ├── attendance/                 # Shift Rosters & Clock-In
│   ├── leaves/                     # Time-Off Approvals
│   ├── payroll/                    # Payroll Wizard & Engine
│   ├── recruitment/                # ATS Kanban Pipeline
│   ├── performance/                # OKRs & 9-Box Matrix
│   ├── learning/                   # LMS Course Catalog
│   ├── assets/                     # Hardware Asset Registry
│   ├── helpdesk/                   # HR Service Desk
│   ├── analytics/                  # BI Chart Reports
│   ├── settings/                   # Tenant White-Label Settings
│   ├── superadmin/                 # SaaS Owner Control
│   │   ├── analytics/
│   │   └── tenants/
│   └── audit/                      # Global Security Audit Logs
```

---

## 4. Design Decisions & Rationale

- **Clean RESTful URL Paths**: Resource paths use lowercase plural nouns (`/employees`, `/payroll`, `/tenants`). Entity detail views append unique UUIDs (`/employees/usr-9402`).

---

## 5. Examples & Implementation Contracts

```jsx
// Dynamic Breadcrumb Generator Contract
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4">
      <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Workspace</Link>
      {segments.map((seg, idx) => {
        const url = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        const title = seg.replace(/-/g, ' ').toUpperCase();

        return (
          <React.Fragment key={url}>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
            {isLast ? (
              <span className="font-semibold text-[var(--text-primary)]">{title}</span>
            ) : (
              <Link href={url} className="hover:text-[var(--text-primary)] transition-colors">{title}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
```

---

## 6. Best Practices

- **Enforce Deep Linking Support**: Ensure every drawer detail view or modal tab updates the URL query string (`?tab=compensation&drawer=open`) to enable shareable URLs.
- **Maintain Clear Route Authorization**: Wrap administrative routes in server-side authorization guards to prevent unauthorized deep linking.

---

## 7. Future Considerations

- **Dynamic Navigation Customization**: Allowing enterprise admins to rename or pin preferred module links in the primary sidebar.
