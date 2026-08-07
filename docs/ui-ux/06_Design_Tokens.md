# 06 — Design Tokens Taxonomy & Tailwind v4 Architecture

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Frontend Engineers, Design System Authors, Build Engineers
- **Cross-References**: `04_Color_System.md`, `05_Typography.md`, `07_Spacing_Grid_System.md`

---

## 1. Purpose

This document details the 3-layer design token architecture for Awais HR. It outlines token naming taxonomies, mapping strategies from primitive variables to semantic intent tokens, and integration patterns for Tailwind CSS v4.

---

## 2. Executive Overview

Awais HR avoids hardcoded values in component CSS. Every visual property—color, spacing, font weight, border radius, shadow depth, blur effect, transition speed—is derived from a structured 3-tier token hierarchy:
1. **Primitive Tokens**: Immutable base values (e.g., `slate-900: #0f172a`).
2. **Semantic Tokens**: Contextual design decisions (e.g., `--bg-surface-l1: var(--primitive-slate-900)`).
3. **Component Tokens**: Element-specific properties (e.g., `--btn-primary-bg: var(--accent-primary)`).

---

## 3. Detailed Specifications

### 3.1 3-Tier Design Token Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      3-TIER TOKEN HIERARCHY                            │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 1: PRIMITIVE TOKENS   ──> Raw values (#6366f1, 16px, 0.25s)       │
│                                  │                                     │
│ TIER 2: SEMANTIC TOKENS    ──> Meaningful intent (--accent-primary)   │
│                                  │                                     │
│ TIER 3: COMPONENT TOKENS   ──> Element target (--button-bg-hover)      │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Token Naming Convention Standard
`[category]-[concept]-[variant]-[state]`
- `color-surface-card-hover`
- `space-padding-compact`
- `border-focus-ring`
- `shadow-elevation-modal`

### 3.3 Complete Token Definition Index

```css
/* Tailwind CSS v4 Theme Mapping Configuration (@import "tailwindcss") */
@theme {
  --color-base: var(--bg-base);
  --color-surface-l1: var(--bg-surface-l1);
  --color-surface-l2: var(--bg-surface-l2);
  --color-surface-l3: var(--bg-surface-l3);

  --color-accent-primary: var(--accent-primary);
  --color-accent-secondary: var(--accent-secondary);
  --color-accent-success: var(--accent-success);
  --color-accent-warning: var(--accent-warning);
  --color-accent-danger: var(--accent-danger);

  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);

  --border-subtle: var(--border-subtle);
  --border-strong: var(--border-strong);

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px -2px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 12px 32px -4px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px -2px rgba(99, 102, 241, 0.35);

  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
}
```

---

## 4. Design Decisions & Rationale

- **Tailwind CSS v4 Native `@theme` Directives**: Leveraging Tailwind v4's native variable binding engine avoids heavy JavaScript bundle overrides while maintaining full autocompletion in IDEs.
- **Zero Arbitrary Values Policy (`[17px]`)**: Arbitrary values inside components are prohibited in code reviews. Every value must reference a registered design token.

---

## 5. Examples & Implementation Contracts

```jsx
// Valid Token Usage in React Component
export function Badge({ children, variant = 'primary' }) {
  const variantStyles = {
    primary: 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border-[var(--accent-primary)]/30',
    success: 'bg-[var(--accent-success)]/15 text-[var(--accent-success)] border-[var(--accent-success)]/30',
    danger: 'bg-[var(--accent-danger)]/15 text-[var(--accent-danger)] border-[var(--accent-danger)]/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
```

---

## 6. Best Practices

- **Never Reference Tier 1 Primitives in Application Code**: Always import Tier 2 Semantic or Tier 3 Component tokens to preserve multi-tenant white-labeling compatibility.
- **Document New Tokens Promptly**: Any addition to the token system must be documented in `06_Design_Tokens.md` and registered in `variables.css`.

---

## 7. Future Considerations

- **Style Dictionary Automated Export**: Automated build scripts converting CSS token definitions directly into Figma Tokens JSON files for designer synchronization.
