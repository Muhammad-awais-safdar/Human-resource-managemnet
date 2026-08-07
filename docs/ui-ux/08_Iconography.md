# 08 — Enterprise Iconography Standards & Visual Metaphors

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: UI Designers, Frontend Engineers, Design System Authors
- **Cross-References**: `04_Color_System.md`, `06_Design_Tokens.md`, `09_Component_Library.md`

---

## 1. Purpose

This document defines the iconography standards for Awais HR. It specifies Lucide React as the mandatory icon set, establishes stroke weights, sizing tiers, semantic icon color pairings, accessibility requirements, and functional metaphors across all modules.

---

## 2. Executive Overview

Iconography in Awais HR serves as a functional visual shorthand, accelerating navigation and status recognition across dense dashboards and tables. To ensure consistency, all icons are built using **Lucide Icons** with a standardized `1.75px` or `2.0px` stroke weight, strict square bounding boxes, and mandatory aria-hidden tags when paired with text labels.

---

## 3. Detailed Specifications

### 3.1 Standardized Icon Sizing Matrix

| Size Token | Pixel Scale | Stroke Width | Primary Usage |
| :--- | :--- | :--- | :--- |
| `icon-xs` | `14px` | `1.75px` | Inline table metadata, badge icons, micro tags |
| `icon-sm` | `16px` | `1.75px` | Standard button icons, form input icons, table actions |
| `icon-md` | `20px` | `2.00px` | Sidebar navigation, modal action titles, card headers |
| `icon-lg` | `24px` | `2.00px` | Feature highlight banners, section heroes |
| `icon-xl` | `32px` | `2.00px` | Empty state illustrations, alert dialog highlights |

### 3.2 Standard Enterprise Visual Metaphor Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE ICON METAPHOR MATRIX                      │
├───────────────────┬──────────────────┬─────────────────────────────────┤
│ HR DOMAIN MODULE  │ MANDATORY ICON   │ METAPHOR & PURPOSE              │
├───────────────────┼──────────────────┼─────────────────────────────────┤
│ Core HR           │ Users            │ Employee directory & org structure│
│ Attendance        │ Clock / Calendar │ Time logs, shift rosters, hours │
│ Leave Management  │ CalendarOff      │ Vacation, sick leave, approvals │
│ Payroll Engine    │ DollarSign/Coins │ Salary calculations, bank file  │
│ Recruitment (ATS) │ UserPlus / Brief │ Job requisitions, candidates    │
│ Performance       │ Target / Award   │ Reviews, OKRs, 9-box matrix     │
│ Security & Audit  │ ShieldCheck/Lock │ Audit ledger, permissions       │
│ AI Copilot        │ Sparkles         │ AI prompt bar, intelligent assist│
└───────────────────┴──────────────────┴─────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Single Icon Family Guarantee (Lucide React)**: Mixing icon sets (e.g., FontAwesome + Heroicons + Lucide) causes stroke weight mismatches and visual noise. Lucide React is strictly enforced across all frontend components.
- **Decorative vs. Standalone Accessibility Rule**: Icons rendered alongside visible text must set `aria-hidden="true"`. Standalone icon buttons must include an explicit `aria-label` attribute and a visual tooltip.

---

## 5. Examples & Implementation Contracts

```jsx
// Icon Wrapper Pattern with Accessibility & Size Tiers
import { LucideIcon } from 'lucide-react';

export function Icon({ icon: IconComponent, size = 'sm', className = '', label }) {
  const sizeMap = {
    xs: { px: 14, stroke: 1.75 },
    sm: { px: 16, stroke: 1.75 },
    md: { px: 20, stroke: 2.0 },
    lg: { px: 24, stroke: 2.0 },
    xl: { px: 32, stroke: 2.0 },
  };

  const config = sizeMap[size] || sizeMap.sm;

  return (
    <IconComponent
      size={config.px}
      strokeWidth={config.stroke}
      className={`shrink-0 ${className}`}
      aria-hidden={!label}
      aria-label={label}
    />
  );
}
```

---

## 6. Best Practices

- **Align Icon Colors to Text Intent**: Match icon colors with text tokens (`text-[var(--text-secondary)]` for neutral, `text-[var(--accent-success)]` for active/approved).
- **Avoid Icon-Only Primary Buttons**: Primary call-to-action buttons must always feature clear text labels alongside an optional icon.

---

## 7. Future Considerations

- **Animated Micro-Icon States**: Subtle Framer Motion stroke drawing animations on active tab selection or status toggling.
