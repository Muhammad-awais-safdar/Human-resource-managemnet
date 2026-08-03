# 11 — Enterprise Navigation Architecture & Command Palette

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Navigation Architects, Frontend Engineers, UX Designers
- **Cross-References**: `03_Design_Principles.md`, `10_Layout_System.md`, `34_Information_Architecture.md`

---

## 1. Purpose

This document details the navigation architecture for Awais HR. It covers the accordion module navigation system, breadcrumb hierarchy, Command Palette (`Cmd + K` / `Ctrl + K`), dynamic tenant workspace switcher, and keyboard navigation bindings.

---

## 2. Executive Overview

With 20+ modules and hundreds of sub-views, traditional multi-level navigation causes fatigue. Awais HR implements a **Dual-Mode Navigation Architecture**:
1. **Visual Accordion Navigation**: Logical grouping of modules into 5 clear categories (Core HR, Workforce Ops, Talent & Growth, Enterprise Admin, Platform Ops).
2. **Command Palette (`Cmd + K`)**: Instant fuzzy search enabling users to jump directly to any page, execute actions, or look up employee records in < 50ms.

---

## 3. Detailed Specifications

### 3.1 Accordion Module Navigation Taxonomy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NAVIGATION CATEGORY TAXONOMY                         │
├───────────────────┬────────────────────────────────────────────────────┤
│ CATEGORY          │ MODULE INCLUSIONS                                  │
├───────────────────┼────────────────────────────────────────────────────┤
│ CORE HR           │ Employee Directory, Org Chart, ESS Portal, MSS     │
│ WORKFORCE OPS     │ Attendance, Leave, Shifts, Assets, Help Desk       │
│ TALENT & GROWTH   │ Recruitment (ATS), Performance, LMS, Succession    │
│ PAYROLL & FIN     │ Payroll Engine, Compensation, Benefits, Expenses   │
│ ENTERPRISE ADMIN  │ Tenant Settings, Roles & Security, Subscriptions   │
│ SAAS PLATFORM OPS │ Tenant Provisioning, System Logs, Audit Ledger     │
└───────────────────┴────────────────────────────────────────────────────┘
```

### 3.2 Command Palette (`Cmd + K`) Modes & Search Categories
- **Global Page Navigation**: Instant search across all 20+ modules and sub-pages.
- **Entity Direct Lookup**: Search employees by name, email, or ID (`"John Doe"` → direct profile link).
- **Instant Quick Actions**: Trigger common workflows (`"Run Payroll"`, `"Onboard Employee"`, `"Request Vacation"`).
- **System Commands**: Change theme mode, toggle sidebar, clear local cache.

---

## 4. Design Decisions & Rationale

- **Command Palette First Mindset**: Power users rely on search over menu browsing. Placing `Cmd + K` prominently in the top bar with visual keyboard shortcuts drastically improves user efficiency.
- **Active Route Highlighting**: Active navigation items feature a distinct background highlight (`bg-[var(--accent-primary)]/15`), a left border indicator (`3px solid var(--accent-primary)`), and bold white text.

---

## 5. Examples & Implementation Contracts

```jsx
// Command Palette Modal Implementation Pattern (cmdk)
import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, User, CreditCard, Calendar, Settings } from 'lucide-react';

export function CommandPaletteModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20">
      <Command className="w-full max-w-2xl bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 border-b border-[var(--border-subtle)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] mr-2" />
          <Command.Input placeholder="Type a command or search employees, modules..." className="w-full h-12 bg-transparent text-sm focus:outline-none text-[var(--text-primary)]" />
        </div>
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Group heading="Quick Jump">
            <Command.Item onSelect={() => {}} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer">
              <User className="w-4 h-4 text-[var(--accent-primary)]" /> Employee Directory
            </Command.Item>
            <Command.Item onSelect={() => {}} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer">
              <CreditCard className="w-4 h-4 text-[var(--accent-success)]" /> Run Monthly Payroll
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
```

---

## 6. Best Practices

- **Auto-Focus Command Input**: When `Cmd + K` opens, the input field must auto-focus instantly.
- **Maintain Keyboard Navigation in Menus**: Ensure `ArrowUp`, `ArrowDown`, and `Enter` seamlessly select command palette results.

---

## 7. Future Considerations

- **AI-Assisted Natural Language Command Bar**: Typing requests like *"Show employees missing attendance from yesterday"* directly executes complex database queries.
