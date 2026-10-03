# Awais HR Enterprise SaaS — UI/UX Design System & Color Scheme Specification

> **Platform Design Architecture Guide**  
> *Comprehensive specification of design tokens, color palettes, typography, interactive layout components, role-based visual states, and glassmorphic micro-animations.*

---

## 1. Design System Philosophy & Vision

The **Awais HR Enterprise SaaS** user interface is engineered to deliver a **high-impact, executive-grade B2B experience**. Built on modern web standards, it combines a sleek, dark-mode foundation (`#0b0f19`) with glassmorphism overlays, dynamic gradient accents, crisp typography (`Inter`), and responsive micro-interactions.

### Key UX Principles:
1. **Executive Aesthetics**: Dark mode background (`#0b0f19`) paired with subtle glassmorphism (`rgba(17, 24, 39, 0.85)`), soft border dividers (`rgba(255, 255, 255, 0.08)`), and soft elevational drop shadows.
2. **Dynamic Context-Aware Feedback**: Role-based color coding (System Admin, Tenant Admin, HR Manager, Employee) and vibrant status feedback states (Success, Warning, Danger, Info).
3. **Accessibility First (WCAG 2.2 AA)**: High contrast text ratios, distinct focus rings (`outline: 2px solid #6366f1`), screen reader helper classes (`.sr-only`), and full keyboard navigateability.
4. **Fluid Motion & Micro-Animations**: Fast cubic-bezier transitions (`150ms` - `250ms`) for button hovers, card lift effects, and custom laser/pulse keyframe animations.

---

## 2. Color Palette & Token Reference

The design system standardizes all colors into CSS custom properties defined in `variables.css`.

### 2.1 Base Surface & Background Tokens

| Token | Hex / Value | Usage & Visual Description |
| :--- | :--- | :--- |
| `--bg-primary` | `#0b0f19` | Deep slate/navy background for viewport body and layout canvas. |
| `--bg-secondary` | `#111827` | Primary container background (sidebar, cards, settings panels). |
| `--bg-surface` | `#1f2937` | Raised surface elements, dropdown menus, and modal dialogs. |
| `--bg-surface-hover` | `#374151` | Hover state background for interactive list items and table rows. |
| `--bg-surface-muted` | `#1e293b` | Form select inputs and muted background containers. |
| `--bg-glass` | `rgba(17, 24, 39, 0.85)` | Glassmorphic overlays with backdrop blur. |

---

### 2.2 Typography & Text Tokens

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--text-primary` | `#f9fafb` | Primary headings, titles, and active body text. |
| `--text-secondary` | `#9ca3af` | Subtitles, labels, descriptions, and metadata text. |
| `--text-muted` | `#6b7280` | Disabled text, section headers, and timestamp captions. |
| `--text-inverse` | `#0b0f19` | Text rendered on top of bright white or vibrant accent backgrounds. |

---

### 2.3 Brand & State Color Palette

```
  Indigo (Primary)     Purple (Secondary)     Emerald (Success)      Amber (Warning)      Rose (Danger)        Royal (Info)
     #6366f1              #8b5cf6               #10b981              #f59e0b             #ef4444              #3b82f6
   [ ████████ ]         [ ████████ ]          [ ████████ ]         [ ████████ ]        [ ████████ ]         [ ████████ ]
```

| Brand Token | Core Color | Hover State | Light Background Tint | Semantic Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`--primary`** | `#6366f1` (Indigo) | `#4f46e5` | `rgba(99, 102, 241, 0.12)` | Main CTAs, active tab indicators, focus rings. |
| **`--secondary`** | `#8b5cf6` (Purple) | `#7c3aed` | `rgba(139, 92, 246, 0.12)` | Secondary buttons, badge highlights, gradient stops. |
| **`--success`** | `#10b981` (Emerald) | `#059669` | `rgba(16, 185, 129, 0.12)` | Active status, approved requests, check-in logs. |
| **`--warning`** | `#f59e0b` (Amber) | `#d97706` | `rgba(245, 158, 11, 0.12)` | Pending approvals, warning alerts, contract renewal notices. |
| **`--danger`** | `#ef4444` (Rose) | `#dc2626` | `rgba(239, 68, 68, 0.12)` | Rejections, security alerts, deletion actions. |
| **`--info`** | `#3b82f6` (Royal Blue) | `#2563eb` | `rgba(59, 130, 246, 0.12)` | System notifications, informational badges, tooltips. |

---

### 2.4 Role-Based Dynamic Badge Styling

Roles are visually distinguished using specialized translucent badge styles with subtle glowing drop-shadows:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  SYSTEM ADMIN   │  │  TENANT ADMIN   │  │   HR MANAGER    │  │    EMPLOYEE     │
│ Amber Gold Glow │  │   Indigo Glow   │  │   Purple Glow   │  │  Emerald Glow   │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

* **System Admin**: Background `rgba(234, 179, 8, 0.12)`, Text `#facc15`, Border `rgba(234, 179, 8, 0.3)`, Shadow `0 0 12px rgba(234, 179, 8, 0.2)`
* **Tenant Admin**: Background `rgba(99, 102, 241, 0.12)`, Text `#818cf8`, Border `rgba(99, 102, 241, 0.3)`, Shadow `0 0 12px rgba(99, 102, 241, 0.2)`
* **HR Manager**: Background `rgba(168, 85, 247, 0.12)`, Text `#c084fc`, Border `rgba(168, 85, 247, 0.3)`
* **Employee**: Background `rgba(16, 185, 129, 0.12)`, Text `#34d399`, Border `rgba(16, 185, 129, 0.3)`

---

## 3. Typography Scale & Layout Tokens

### 3.1 Font Families
* **Primary Display & Body Font**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Code & Monospace Font**: `'JetBrains Mono', 'Fira Code', monospace`

### 3.2 Type Scale

| Size Token | Font Size | Line Height | Usage |
| :--- | :--- | :--- | :--- |
| `--fs-display` | `2.25rem` (`36px`) | `1.2` | Hero section headlines, metric banner numbers. |
| `--fs-h1` | `1.75rem` (`28px`) | `1.3` | Page title headers (`.page-title`). |
| `--fs-h2` | `1.35rem` (`21.6px`) | `1.4` | Section headers and modal titles. |
| `--fs-h3` | `1.1rem` (`17.6px`) | `1.4` | Card titles and form section headers. |
| `--fs-body` | `0.9375rem` (`15px`) | `1.5` | Standard body text, form inputs, table data cells. |
| `--fs-small` | `0.8125rem` (`13px`) | `1.5` | Sidebar nav items, subheadings, table headers. |
| `--fs-caption` | `0.75rem` (`12px`) | `1.4` | Metadata captions, timestamps, badge labels. |

---

### 3.3 Border Radius & Elevation Scale

* **Radius Tokens**:
  * `--radius-sm`: `6px` (Buttons, inputs, badge tags)
  * `--radius-md`: `8px` (Org chart nodes, nav items)
  * `--radius-lg`: `12px` (Cards, sidebar, form panels)
  * `--radius-xl`: `16px` (Modal windows, popovers)
  * `--radius-pill`: `9999px` (Pill badges, avatars)

* **Shadow & Elevation Tokens**:
  * `--shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.3)`
  * `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)`
  * `--shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)`
  * `--shadow-focus`: `0 0 0 3px rgba(99, 102, 241, 0.35)`

---

## 4. Specialized Layouts & Visual Components

### 4.1 Glassmorphic Custom Dual Scrollbars
The dashboard viewport separates the **Sidebar Navigation** and **Main Content Area** into independent scroll contexts with custom gradient scrollbars:

```css
/* Sidebar Glassmorphic Scrollbar */
.sidebar-nav::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6366f1, #a855f7);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

/* Main Viewport Content Scrollbar */
.main-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5));
  border: 2px solid #09090b;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
}
```

---

### 4.2 Interactive Org Chart Tree Diagram (`.org-chart-container`)
Pure CSS node tree rendering using pseudo-elements (`::before`, `::after`) for automatic hierarchy line connecting:

* **Legal Entity Node**: `#a855f7` (Purple Badge)
* **Cost Center Node**: `#f97316` (Orange Badge)
* **Department Node**: `#3b82f6` (Blue Badge)
* **Team Node**: `#14b8a6` (Teal Badge)

---

### 4.3 ATS Kanban Requisition Board (`.kanban-board`)
* Horizontal scrollable column container (`min-width: 250px`).
* Drag-and-drop card states with hover lift effect (`transform: translateY(-2px)`).
* Rounded status counts (`.kanban-column-count`).

---

### 4.4 Custom Keyframe Micro-Animations

#### **Biometric Laser Scanner (`@keyframes scanLaser`)**
Used in attendance check-in biometric modals:
```css
@keyframes scanLaser {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}
```

#### **Product Tour Target Pulse (`@keyframes pulseGlow`)**
Used during onboarding step highlights:
```css
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.1); }
}
```

---

## 5. File Structure Reference

* **Tokens & Variables**: [`frontend/src/styles/variables.css`](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src/styles/variables.css)
* **Layout & Dashboard Components**: [`frontend/src/styles/dashboard.css`](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src/styles/dashboard.css)
* **Global Overrides & Animations**: [`frontend/src/app/globals.css`](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src/app/globals.css)

---
*Maintained by the Awais HR Enterprise SaaS Core Design Team.*
