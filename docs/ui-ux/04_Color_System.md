# 04 — Enterprise Color System & Contrast Architecture

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: UI Engineers, Theme Architects, Accessibility Specialists
- **Cross-References**: `02_Brand_Guidelines.md`, `06_Design_Tokens.md`, `29_Accessibility.md`

---

## 1. Purpose

This document defines the complete color system for Awais HR across Dark and Light display modes. It outlines functional semantic palettes, status indicators, surface elevation tiers, border tones, and contrast matrix rules guaranteeing WCAG 2.1 AA+ accessibility compliance.

---

## 2. Executive Overview

Awais HR features a dual-mode color architecture with a primary focus on dark mode (`#0a0a0c`). Rather than relying on standard grey scales, the color palette is built using HSL-calibrated slate, zinc, indigo, and emerald hues to produce a visual experience that is rich, non-fatiguing, and distinctively enterprise.

---

## 3. Detailed Specifications

### 3.1 Dark Mode Palette Matrix (Default Surface)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DARK MODE PALETTE                               │
├─────────────────┬──────────────────────────┬───────────────────────────┤
│ TOKEN           │ HEX CODE / HSL           │ FUNCTIONAL PURPOSE        │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ --bg-base       │ #0a0a0c (hsl 240 14% 4%) │ Deepest canvas backdrop   │
│ --bg-surface-l1 │ #121216 (hsl 240 10% 8%) │ Standard cards & containers│
│ --bg-surface-l2 │ #1a1a22 (hsl 240 14% 12%)│ Popovers, hover states    │
│ --bg-surface-l3 │ #242430 (hsl 240 14% 17%)│ Modal surfaces & inputs   │
│ --border-subtle │ rgba(255,255,255, 0.07)  │ Card & grid dividers      │
│ --border-strong │ rgba(255,255,255, 0.15)  │ Input & active borders    │
│ --text-primary  │ #f3f4f6 (hsl 220 14% 96%)│ Primary titles & body     │
│ --text-secondary│ #9ca3af (hsl 218 11% 65%)│ Subtitles, labels, icons  │
│ --text-muted    │ #6b7280 (hsl 220 9% 46%) │ Captions & disabled text  │
└─────────────────┴──────────────────────────┴───────────────────────────┘
```

### 3.2 Light Mode Palette Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                       LIGHT MODE PALETTE                               │
├─────────────────┬──────────────────────────┬───────────────────────────┤
│ TOKEN           │ HEX CODE / HSL           │ FUNCTIONAL PURPOSE        │
├─────────────────┼──────────────────────────┼───────────────────────────┤
│ --bg-base       │ #f8fafc (hsl 210 40% 98%)│ Clean application backdrop│
│ --bg-surface-l1 │ #ffffff (hsl 0 0% 100%)  │ Primary container cards   │
│ --bg-surface-l2 │ #f1f5f9 (hsl 210 40% 96%)│ Table headers & hovers   │
│ --bg-surface-l3 │ #e2e8f0 (hsl 214 32% 91%)│ Active selection fills    │
│ --border-subtle │ #e2e8f0 (hsl 214 32% 91%)│ Card dividers             │
│ --border-strong │ #cbd5e1 (hsl 213 27% 84%)│ Focus borders             │
│ --text-primary  │ #0f172a (hsl 222 47% 11%)│ Primary body copy         │
│ --text-secondary│ #475569 (hsl 215 25% 35%)│ Subtext & secondary text  │
│ --text-muted    │ #94a3b8 (hsl 215 16% 65%)│ Helper text & disabled    │
└─────────────────┴──────────────────────────┴───────────────────────────┘
```

### 3.3 Semantic Intent Palettes (Dual-Mode Equivalence)

| Intent State | Dark Mode Accent | Dark Mode Tint Fill | Light Mode Accent | Light Mode Tint Fill |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#6366f1` (Indigo 500) | `rgba(99,102,241, 0.12)` | `#4f46e5` (Indigo 600) | `#e0e7ff` (Indigo 100) |
| **Success** | `#10b981` (Emerald 500)| `rgba(16,185,129, 0.12)` | `#059669` (Emerald 600)| `#d1fae5` (Emerald 100)|
| **Warning** | `#f59e0b` (Amber 500)  | `rgba(245,158,11, 0.12)` | `#d97706` (Amber 600)  | `#fef3c7` (Amber 100)  |
| **Danger**  | `#ef4444` (Red 500)    | `rgba(239,68,68, 0.12)`  | `#dc2626` (Red 600)    | `#fee2e2` (Red 100)    |
| **Info**    | `#3b82f6` (Blue 500)   | `rgba(59,130,246, 0.12)` | `#2563eb` (Blue 600)   | `#dbeafe` (Blue 100)   |

---

## 4. Design Decisions & Rationale

- **No Pure Black (`#000000`) for Surfaces**: Pure black backgrounds create extreme contrast against text, causing visual vibration and eye strain. `#0a0a0c` provides a deep surface while preserving natural color blending.
- **Glassmorphic Border Highlights**: Outer borders use subtle semi-transparent white fills (`rgba(255,255,255, 0.08)` in dark mode) to simulate physical edge lighting on cards.

---

## 5. Examples & Implementation Contracts

```css
/* Color System Tokens (variables.css) */
:root {
  /* Dark Mode Defaults */
  --bg-base: #0a0a0c;
  --bg-surface-l1: #121216;
  --bg-surface-l2: #1a1a22;
  --bg-surface-l3: #242430;

  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  --accent-primary: #6366f1;
  --accent-primary-hover: #4f46e5;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;

  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.15);
}

[data-theme='light'] {
  --bg-base: #f8fafc;
  --bg-surface-l1: #ffffff;
  --bg-surface-l2: #f1f5f9;
  --bg-surface-l3: #e2e8f0;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;

  --accent-primary: #4f46e5;
  --accent-primary-hover: #4338ca;
  --accent-success: #059669;
  --accent-warning: #d97706;
  --accent-danger: #dc2626;

  --border-subtle: #e2e8f0;
  --border-strong: #cbd5e1;
}
```

---

## 6. Best Practices

- **Pair Status Text with Icons**: Never rely on color alone to communicate status (e.g., pair red danger text with an Alert Triangle icon for colorblind accessibility).
- **Enforce Contrast Minimums**: Text smaller than `18px` must maintain a contrast ratio of >= 4.5:1 against its immediate parent background.

---

## 7. Future Considerations

- **High-Contrast Accessibility Mode**: Dedicated CSS theme override for users requiring > 7:1 contrast compliance across all elements.
