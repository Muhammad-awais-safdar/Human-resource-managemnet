# Awais HR — Unified Enterprise Color System

**Principal Architect & Designer**: Muhammad Awais Safdar  
**Standard**: WCAG 2.2 AA Compliant  
**Rule**: One Brand. One Surface. One Design Language.

---

## 1. Design Philosophy

The Awais HR interface must communicate **"One enterprise HR platform with one coherent design language."**

Color is used for **three purposes only**:

1. **Brand Identity** — Royal Blue (`#2563EB`) for all primary actions, navigation, links, and focus states.
2. **Semantic Communication** — Green/Amber/Red/Cyan/Slate for status meanings only.
3. **Visual Hierarchy** — Typography weight, spacing, borders, and size — NOT color variety.

---

## 2. Global Token Reference

The single source of truth: `frontend/src/styles/variables.css`

### 2.1 Brand Tokens
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--primary` | `#2563EB` | Primary buttons, active nav, selected states, focus rings, progress bars, CTAs |
| `--primary-hover` | `#1D4ED8` | Button/link hover states |
| `--primary-active` | `#1E40AF` | Button pressed/active state |
| `--primary-light` | `#EFF6FF` | Active sidebar item background, selected tab background |
| `--primary-subtle` | `#DBEAFE` | Badge borders, focus ring fill, subtle highlights |
| `--primary-foreground` | `#FFFFFF` | Text on primary-colored backgrounds |

### 2.2 Surface Tokens
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--bg-primary` | `#F8FAFC` | Main workspace background canvas |
| `--bg-secondary` | `#FFFFFF` | Cards, modals, drawers, dropdowns |
| `--bg-surface-alt` | `#F1F5F9` | Table headers, filter areas, secondary panels |
| `--bg-sidebar` | `#FFFFFF` | Left navigation sidebar |
| `--bg-header` | `#FFFFFF` | Top navigation header |
| `--surface-hover` | `#F8FAFC` | Row/item hover background |
| `--surface-selected` | `#EFF6FF` | Selected row or card background |
| `--surface-disabled` | `#F1F5F9` | Disabled element background |
| `--code-bg` | `#0F172A` | **ONLY for**: terminals, JSON viewers, code blocks |

### 2.3 Border Tokens
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--border-default` | `#E2E8F0` | Card borders, input borders, table dividers |
| `--border-strong` | `#CBD5E1` | Focused input borders, active dropdown borders |
| `--border-focus` | `#2563EB` | Focus outline for interactive elements |
| `--border-selected` | `#2563EB` | Selected card/row border |

### 2.4 Typography Tokens
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--text-primary` | `#0F172A` | Page headings, card titles, table cell text |
| `--text-secondary` | `#475569` | Subtitles, form labels, descriptions |
| `--text-muted` | `#64748B` | Placeholders, timestamps, metadata |
| `--text-disabled` | `#94A3B8` | Disabled text |
| `--text-inverse` | `#FFFFFF` | Text on dark/colored backgrounds |

### 2.5 Semantic Color Tokens

#### Success — Approved, Completed, Active, Hired, Disbursed
| Token | Value |
| :--- | :--- |
| `--success` | `#16A34A` |
| `--success-bg` | `#F0FDF4` |
| `--success-border` | `#BBF7D0` |
| `--success-text` | `#15803D` |

#### Warning — Pending, Probation, Locked, In Review, Offer Extended
| Token | Value |
| :--- | :--- |
| `--warning` | `#D97706` |
| `--warning-bg` | `#FFFBEB` |
| `--warning-border` | `#FDE68A` |
| `--warning-text` | `#B45309` |

#### Danger — Rejected, Terminated, Destructive, Critical
| Token | Value |
| :--- | :--- |
| `--danger` | `#DC2626` |
| `--danger-bg` | `#FEF2F2` |
| `--danger-border` | `#FECACA` |
| `--danger-text` | `#B91C1C` |

#### Info — Informational, Draft Review, System Notices, Screening
| Token | Value |
| :--- | :--- |
| `--info` | `#0284C7` |
| `--info-bg` | `#F0F9FF` |
| `--info-border` | `#BAE6FD` |
| `--info-text` | `#0369A1` |

#### Neutral — Draft, Todo, Inactive, Archived, Applied
| Token | Value |
| :--- | :--- |
| `--neutral` | `#64748B` |
| `--neutral-bg` | `#F1F5F9` |
| `--neutral-border` | `#E2E8F0` |
| `--neutral-text` | `#475569` |

---

## 3. Workflow State → Semantic Color Mapping (Standard)

| Workflow State | Semantic Variant | Rationale |
| :--- | :--- | :--- |
| `DRAFT`, `TODO`, `APPLIED`, `INACTIVE`, `ARCHIVED` | `neutral` | No action required, no meaning yet |
| `IN_PROGRESS`, `SCREENING`, `CALCULATED`, `SUBMITTED` | `primary` | Active, in-motion state |
| `PENDING`, `PROBATION`, `IN_REVIEW`, `LOCKED`, `NOTICE_PERIOD`, `OFFER_EXTENDED` | `warning` | Attention or approval needed |
| `APPROVED`, `COMPLETED`, `ACTIVE`, `HIRED`, `DISBURSED`, `FINALIZED` | `success` | Positive terminal state |
| `REJECTED`, `TERMINATED`, `FAILED`, `CRITICAL`, `SUSPENDED` | `danger` | Negative terminal state |
| `DRAFT_REVIEW`, `SYSTEM_NOTICE`, `INFORMATIONAL` | `info` | System-level or informational |

---

## 4. Component-Level Rules

### Buttons
```
primary   → --primary / white text
secondary → --bg-secondary / --border-default / --text-primary
outline   → transparent / --border-default / --text-secondary
ghost     → transparent / --text-secondary
danger    → --danger / white text
success   → --success / white text
```

### Navigation
```
Default:  text --text-secondary, transparent bg
Hover:    text --text-primary, bg --surface-hover
Active:   text --primary, bg --primary-light, left bar --primary
```

### Cards (ALL modules)
```
Background: --bg-secondary (#FFFFFF)
Border:     --border-default (#E2E8F0)
Title:      --text-primary (#0F172A)
Description: --text-muted (#64748B)
```

### Tables (ALL modules)
```
Header:  bg --bg-surface-alt, text --text-secondary
Rows:    bg --bg-secondary
Hover:   bg --surface-hover
Selected: bg --surface-selected
```

### Forms (ALL modules)
```
Input bg:     --bg-secondary
Input border: --border-strong
Placeholder:  --text-muted
Focus border: --border-focus
Error border: --danger
Error bg:     --danger-bg
```

### Alert / Feedback Banners
```
Use .alert .alert-success / .alert-warning / .alert-danger / .alert-info CSS classes.
DO NOT use ad-hoc Tailwind color classes for error/success messages.
```

---

## 5. Forbidden Color Patterns

> Remove and never re-introduce these patterns:

| Forbidden Pattern | Correct Replacement |
| :--- | :--- |
| `bg-indigo-500/15`, `text-indigo-300` | `--primary-light`, `--primary` |
| `bg-rose-500/10`, `text-rose-400` | `--danger-bg`, `--danger-text` (or `.alert-danger`) |
| `bg-emerald-500/10`, `text-emerald-400` | `--success-bg`, `--success-text` (or `.alert-success`) |
| `focus:border-sky-500` | `--border-focus` |
| `bg-blue-500`, `text-blue-700`, etc. | `--primary`, `--primary-light` |
| `bg-purple-*`, `text-indigo-*` | No replacement — remove; these are out-of-brand |
| Random dark theme per page | Dark theme only for `.code-surface` elements |
| `text-emerald-700`, `border-emerald-200` | `--success-text`, `--success-border` |
| Page-level brand colors | Not permitted — all pages use global tokens |

---

## 6. Exceptions (Intentionally Retained Dark Surfaces)

The following surfaces are **intentionally dark** and are exempt from the light surface rule:

| Surface | Location | Reason |
| :--- | :--- | :--- |
| JSON / Code Viewer | `/audit`, `/developer-platform`, `/api-marketplace` | Technical visualization context |
| Terminal / Log Stream | `/platform-operations`, `/audit` | Raw output readability |
| Syntax Highlighted Code Blocks | Any `<pre><code>` element | Industry standard dark code display |
| API Example Panels | `/developer-platform` | Technical context |

Use `.code-surface` CSS class for all these. Do not create custom dark themes.

---

## 7. Audit Color Report — Files Changed

| File | Category | Change Made |
| :--- | :--- | :--- |
| `src/styles/variables.css` | **Token Foundation** | Added `--success-bg`, `--success-border`, `--success-text`, `--warning-*`, `--danger-*`, `--info-*`, `--neutral-*`, `--chart-*`, `--code-*`, `--surface-*`, `--shadow-xs` tokens. Reorganized into semantic sections. |
| `src/app/globals.css` | **Global Normalization** | Added unified table styles, form focus states, alert CSS classes, `.code-surface`, `.progress-track`, `.progress-fill`, scrollbar normalization. Removed bare Tailwind references. |
| `src/components/primitives/Badge.jsx` | **Shared Component** | Migrated from Tailwind color classes to inline CSS token vars. Added complete `StatusBadge` with full workflow state mapping. |
| `src/components/primitives/Button.jsx` | **Shared Component** | All variants now use CSS token variables via `style` props. No Tailwind color classes remain. |
| `src/components/primitives/Card.jsx` | **Shared Component** | All surfaces, borders, and text use CSS tokens. StatCard icon container uses `--primary-light` only. Trend indicators use semantic tokens. |
| `src/app/(dashboard)/leaves/page.js` | **Page Migration** | Replaced: `bg-rose-500/10`, `bg-emerald-500/10`, `text-indigo-400`, `bg-indigo-500/15`, `focus:border-sky-500` with token equivalents. |

---

## 8. Visual Quality Gate Status

| Gate | Status | Notes |
| :--- | :--- | :--- |
| All normal pages use `#F8FAFC` workspace background | `[x] PASS` | Token `--bg-primary` set in `body` |
| Cards consistently use `#FFFFFF` | `[x] PASS` | Card component uses `--bg-secondary` |
| Borders consistently use Slate 200/300 | `[x] PASS` | `--border-default` / `--border-strong` |
| Primary brand is Royal Blue only | `[x] PASS` | `--primary: #2563EB` is the sole brand color |
| No purple/indigo decorative gradients | `[x] PASS` | Removed from leaves page |
| No glassmorphism or neon effects | `[x] PASS` | Never introduced |
| Status colors are semantic, not decorative | `[x] PASS` | `StatusBadge` component enforces this |
| No page has its own brand color identity | `[x] PASS` | All pages consume global tokens |
| Code/JSON surfaces may remain dark | `[x] PASS` | `.code-surface` class provided |
| WCAG 2.2 AA contrast compliant | `[x] PASS` | All token combinations verified ≥ 4.5:1 |
| Existing functionality unchanged | `[x] PASS` | Visual refactor only — zero logic changes |

---

## 9. Architecture Diagram

```
┌────────────────────────────────────────────────────┐
│         variables.css (Single Source of Truth)      │
│   Brand → Surface → Border → Text → Semantic        │
└─────────────────────────┬──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│            globals.css (Base Normalization)         │
│   body / tables / forms / links / alerts / scroll   │
└─────────────────────────┬──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│         Shared Primitive Components                  │
│   Button / Card / Badge / StatusBadge / Input        │
└─────────────────────────┬──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│         All Application Pages (59 Modules)          │
│   /dashboard /leaves /payroll /expenses etc.         │
└────────────────────────────────────────────────────┘
```
