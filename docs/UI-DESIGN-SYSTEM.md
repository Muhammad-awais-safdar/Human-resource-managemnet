# Awais HR Enterprise SaaS - Design System Documentation

## Overview

The Awais HR Enterprise SaaS Design System provides a standardized, accessible (WCAG 2.2 AA compliant), dark-mode-first visual language tailored for modern B2B SaaS applications.

---

## Design Tokens

### Color Tokens (`styles/variables.css`)

- **Primary Background**: `--bg-primary` (`#0b0f19`)
- **Secondary Surface**: `--bg-secondary` (`#111827`)
- **Surface Elevation**: `--bg-surface` (`#1f2937`)
- **Muted Surface**: `--bg-surface-muted` (`#1e293b`)
- **Primary Brand Accent**: `--primary` (`#6366f1` / Indigo-600)
- **Secondary Accent**: `--secondary` (`#8b5cf6` / Purple-600)
- **State - Success**: `--success` (`#10b981` / Emerald-500)
- **State - Warning**: `--warning` (`#f59e0b` / Amber-500)
- **State - Danger**: `--danger` (`#ef4444` / Rose-500)
- **State - Info**: `--info` (`#3b82f6` / Blue-500)

### Spacing & Radius Tokens

- **Spacing Scale**: `4px` (`xs`), `8px` (`sm`), `16px` (`md`), `24px` (`lg`), `32px` (`xl`), `48px` (`2xl`)
- **Radius Scale**: `6px` (`sm`), `8px` (`md`), `12px` (`lg`), `16px` (`xl`), `9999px` (`pill`)

---

## Primitive Component Library (`components/primitives/`)

1. **`Button` / `IconButton`**: Min 44x44px touch targets, loading spinner state, focus rings, variants (`primary`, `secondary`, `outline`, `ghost`, `danger`, `success`).
2. **`Input` / `Select`**: Persistent top labels, inline error messages, helper text, required asterisks, and WCAG focus rings.
3. **`Card` / `StatCard`**: Status-bordered metric widgets with trend direction indicators (`up` / `down`).
4. **`Badge` / `StatusPill`**: Semantic status pills (`ACTIVE`, `PENDING`, `APPROVED`, `SUSPENDED`).
5. **`DataTable`**: Standard enterprise table with search, pagination, bulk selection, column visibility, sticky header, and empty states.
6. **`Dialog` / `Drawer`**: Accessible modal containers with focus trapping, backdrop click dismissal, and `Esc` key handling.
7. **`Skeleton` / `TableSkeleton` / `CardSkeleton`**: Progressive layout loading indicators.
8. **`EmptyState` / `ErrorState`**: Actionable fallback containers.
