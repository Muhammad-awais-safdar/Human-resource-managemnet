# 15 — Theme Engine, HSL Tokens & Multi-Tenant White-Labeling

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Theme Engineers, CSS Architects, White-Labeling Leads
- **Design System Cross-Reference**: `docs/ui-ux/02_Brand_Guidelines.md`, `docs/ui-ux/04_Color_System.md`, `docs/ui-ux/06_Design_Tokens.md`

---

## 1. Purpose

This document specifies the theme engine architecture for **Awais HR**. Built with **Tailwind CSS v4** and native CSS HSL variables, it details dark mode (`#0a0a0c`), light mode (`#f8fafc`), dynamic tenant white-label branding overrides, and automated contrast guards.

---

## 2. Scope

This specification governs all color CSS tokens, surface elevation variables, multi-tenant brand token injection, and theme toggle switches across the application.

---

## 3. Standards & Theme Architecture

### 3.1 Dual-Mode Color Token Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ DUAL-MODE COLOR TOKEN MATRIX                                           │
├─────────────────┬──────────────────────────┬───────────────────────────┤
│ VARIABLE NAME   │ DARK MODE VALUE          │ LIGHT MODE VALUE          │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ --bg-base       │ #0a0a0c (hsl 240 14% 4%) │ #f8fafc (hsl 210 40% 98%) │
│ --bg-surface-l1 │ #121216 (hsl 240 10% 8%) │ #ffffff (hsl 0 0% 100%)   │
│ --bg-surface-l2 │ #1a1a22 (hsl 240 14% 12%)│ #f1f5f9 (hsl 210 40% 96%) │
│ --text-primary  │ #f3f4f6 (hsl 220 14% 96%)│ #0f172a (hsl 222 47% 11%) │
│ --text-secondary│ #9ca3af (hsl 218 11% 65%)│ #475569 (hsl 215 25% 35%) │
│ --accent-primary│ #6366f1 (Indigo 500)     │ #4f46e5 (Indigo 600)      │
│ --border-subtle │ rgba(255,255,255, 0.07)  │ #e2e8f0                   │
└─────────────────┴──────────────────────────┴───────────────────────────┘
```

---

## 4. Folder Structure & Theme Directory

```
src/
├── styles/
│   ├── variables.css               # Root CSS HSL Variables
│   └── globals.css                 # Tailwind v4 Imports & Theme Mapping
├── store/
│   └── useUserPreferencesStore.ts  # Theme Mode Store ('dark' | 'light')
└── utils/
    └── applyTenantBranding.ts      # Dynamic Tenant HSL Branding Engine
```

---

## 5. Naming Conventions

- **CSS Variables**: `--category-variant` (e.g. `--bg-surface-l1`, `--accent-primary`).
- **Theme Function**: `applyTenantBranding.ts`.

---

## 6. Implementation Code Contracts

```typescript
// Dynamic Multi-Tenant White-Label Branding Engine (src/utils/applyTenantBranding.ts)
export interface TenantBrandingConfig {
  primaryColor?: string; // HEX or HSL
  secondaryColor?: string;
  logoUrl?: string;
}

export function applyTenantBranding(branding?: TenantBrandingConfig) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  if (branding?.primaryColor) {
    root.style.setProperty('--accent-primary', branding.primaryColor);
  }

  if (branding?.secondaryColor) {
    root.style.setProperty('--accent-secondary', branding.secondaryColor);
  }

  if (branding?.logoUrl) {
    const logoEl = document.getElementById('tenant-app-logo') as HTMLImageElement;
    if (logoEl) logoEl.src = branding.logoUrl;
  }
}
```

---

## 7. Best Practices

- **Use CSS HSL Variables**: Reference CSS variables in Tailwind v4 theme mapping (`--color-base: var(--bg-base)`).
- **Enforce Contrast Guard Checks**: Run luminance checks before applying tenant primary colors to ensure text remains readable (>= 4.5:1 ratio).

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** default to Dark Mode (`#0a0a0c`) for high-density power user interfaces.
- **DO** use `data-theme="light"` attributes on `<html>` root element when light mode is selected.

### Don'ts
- **DON'T** hardcode raw HEX colors inside component files; always use theme CSS tokens.
- **DON'T** allow tenant primary brand overrides to break border visibility or focus rings.

---

## 9. Dependencies Reference

- `tailwindcss`: `^4.0.0`
- `@theme`: Tailwind v4 theme CSS directives

---

## 10. Implementation Notes

Theme changes execute instantaneously by toggling `data-theme` on the root document element, triggering sub-10ms CSS variable recalculation.
