# 14 — Command Palette (`Cmd + K`) & Global Keyboard Navigation

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Command Palette Developers, Keyboard Accessibility Leads, UX Engineers
- **Design System Cross-Reference**: `docs/ui-ux/11_Navigation_System.md`

---

## 1. Purpose

This document details the global Command Palette (`Cmd + K` / `Ctrl + K`) implementation for **Awais HR** using **cmdk**.

---

## 2. Scope

This specification governs global search, module quick jumping, employee profile lookups, quick workflow execution triggers, system command execution, and global keyboard shortcut bindings.

---

## 3. Standards & Command Categories

### 3.1 Command Category Hierarchy
- **Quick Jump**: Direct navigation to modules (`/employees`, `/payroll`, `/ats`).
- **Entity Direct Lookup**: Instant search for employee profiles or candidate records.
- **Workflow Actions**: Trigger actions (`Run Payroll`, `Create Requisition`, `Clock In`).
- **System Commands**: Toggle theme (`Dark/Light`), Toggle Sidebar, Clear Cache.

---

## 4. Folder Structure & Command Palette Directory

```
src/components/shell/
├── CommandPaletteModal.tsx        # Master cmdk Modal Wrapper
├── command-items/                  # Command Item Groups
│   ├── PageJumpCommands.tsx        # Module navigation items
│   ├── EmployeeLookupCommands.tsx  # Dynamic entity search items
│   └── SystemActionCommands.tsx    # Theme & preference triggers
└── hooks/
    └── useHotkeys.ts               # Hotkey keyboard listener hook
```

---

## 5. Naming Conventions

- **Command Components**: `CommandPaletteModal.tsx`, `PageJumpCommands.tsx`.
- **Command Store**: `useCommandPaletteStore.ts`.

---

## 6. Implementation Code Contracts

```typescript
// Command Palette Modal Implementation Contract (src/components/shell/CommandPaletteModal.tsx)
import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, User, CreditCard, Settings } from 'lucide-react';
import { useCommandPaletteStore } from '@/store/useCommandPaletteStore';

export function CommandPaletteModal() {
  const { isOpen, close } = useCommandPaletteStore();
  const router = Router();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useCommandPaletteStore.getState().toggle();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20">
      <Command className="w-full max-w-2xl bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 border-b border-[var(--border-subtle)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] mr-2" />
          <Command.Input
            placeholder="Type a command or search employees..."
            className="w-full h-12 bg-transparent text-sm text-[var(--text-primary)] focus:outline-none"
          />
        </div>
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Group heading="Quick Jump">
            <Command.Item
              onSelect={() => { router.push('/employees'); close(); }}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)]"
            >
              <User className="w-4 h-4 text-[var(--accent-primary)]" /> Employee Directory
            </Command.Item>
            <Command.Item
              onSelect={() => { router.push('/payroll'); close(); }}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)]"
            >
              <CreditCard className="w-4 h-4 text-[var(--accent-success)]" /> Run Payroll
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
```

---

## 7. Best Practices

- **Auto-Focus Input Field**: Input field must auto-focus instantly when the Command Palette opens.
- **Support Arrow Navigation**: Ensure `ArrowUp`, `ArrowDown`, and `Enter` keys navigate command options smoothly.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** display keyboard shortcuts (`Cmd+K`, `J/K`, `Esc`) next to command items.
- **DO** close the Command Palette modal immediately upon executing an action or navigating.

### Don'ts
- **DON'T** load full database entity sets inside the Command Palette; stream search results asynchronously.
- **DON'T** block keyboard events when form input fields are actively focused unless `Cmd+K` is explicitly pressed.

---

## 9. Dependencies Reference

- `cmdk`: Accessible command menu component library

---

## 10. Implementation Notes

Pressing `Escape` closes the Command Palette overlay immediately and restores focus to the previously active element.
