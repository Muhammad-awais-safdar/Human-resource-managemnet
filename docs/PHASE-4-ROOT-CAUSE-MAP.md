# Phase 4 Root Cause Map & Dependency Graph

## Overview
This document maps all observed baseline errors back to their shared root cause to prevent symptom patching.

---

## Shared Root Cause Graph

```
ROOT CAUSE RC-1: API Service Module Import Mismatch
├── Description: Vertical dashboard pages import from non-existent `@/lib/api` instead of `@/services/api`
├── Affected Errors: ERR-001, ERR-002, ERR-003, ERR-004, ERR-005, ERR-006
├── Affected Components:
│   ├── frontend/src/app/(dashboard)/agritech/page.js
│   ├── frontend/src/app/(dashboard)/healthcare/page.js
│   ├── frontend/src/app/(dashboard)/hospitality/page.js
│   ├── frontend/src/app/(dashboard)/it-services/page.js
│   ├── frontend/src/app/(dashboard)/manufacturing/page.js
│   └── frontend/src/app/(dashboard)/retail/page.js
└── Remediation: Update `@/lib/api` imports to `@/services/api` and ensure `jsconfig.json` alias is configured.

ROOT CAUSE RC-2: Synchronous State Updates inside `useEffect` (React 19 / ESLint strict rule)
├── Description: `useEffect` callbacks invoke data loading functions that call `setState` synchronously within the effect body
├── Affected Errors: ERR-007, ERR-008, ERR-009, ERR-010, ERR-011, ERR-012, ERR-013, ERR-014, ERR-015
├── Affected Components:
│   ├── frontend/src/app/(dashboard)/agritech/page.js
│   ├── frontend/src/app/(dashboard)/healthcare/page.js
│   ├── frontend/src/app/(dashboard)/hospitality/page.js
│   ├── frontend/src/app/(dashboard)/it-services/page.js
│   ├── frontend/src/app/(dashboard)/manufacturing/page.js
│   ├── frontend/src/app/(dashboard)/retail/page.js
│   ├── frontend/src/app/(dashboard)/roles/page.js
│   ├── frontend/src/app/(dashboard)/org-chart/page.js
│   └── frontend/src/app/page.js
└── Remediation: Wrap state updates inside `useEffect` with `let isMounted = true` / async effect functions or event-driven triggers.
```
