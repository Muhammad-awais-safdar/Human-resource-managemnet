# 03 — Core Design Principles & UX Philosophy

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: UX Designers, Product Managers, Frontend Engineers, QA Architects
- **Cross-References**: `01_UI_UX_Vision.md`, `07_Spacing_Grid_System.md`, `29_Accessibility.md`, `44_UI_UX_Best_Practices.md`

---

## 1. Purpose

This document details the 7 foundational UI/UX design principles that dictate every screen, component, flow, and state in Awais HR. These principles serve as non-negotiable architectural rules during design reviews, component engineering, and QA audits.

---

## 2. Executive Overview

Enterprise software often fails because product teams prioritize decorative flourishes over daily usability. In an enterprise HR platform where users process hundreds of employee requests, complex payroll runs, and candidate scorecards, friction directly causes operational delays and fatigue. 

Awais HR is built upon **High Data Density**, **Keyboard First Efficiency**, **Instant Visual Feedback**, and **Contextual Clarity**.

---

## 3. Detailed Specifications

### The 7 Pillars of Awais HR UX

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THE 7 CORE DESIGN PILLARS                            │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. DATA DENSITY      ──> High information ratio per view; zero bloat    │
│ 2. KEYBOARD FIRST    ──> 100% executable without touch/mouse input      │
│ 3. INSTANT FEEDBACK  ──> Optimistic UI updates & sub-100ms state changes│
│ 4. PROGRESSIVE DISCL.──> Expose primary data first; drawer detail drill │
│ 5. PREDICTABLE SHELL ──> Standardized layout anatomy across all 20+ modules│
│ 6. CONTEXTUALLY SAFE ──> Destructive actions require explicit confirmation│
│ 7. INCLUSIVE BY RULE ──> WCAG AA+, high-contrast, screen-reader friendly │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Pillar 1: High Functional Data Density
- Use structured tabular layouts, compact vertical rhythm (36px table row height default), and dense metric badges.
- Avoid giant empty padding blocks that force unnecessary scrolling.

#### Pillar 2: Keyboard-First Efficiency
- Global Command Palette (`Cmd + K` / `Ctrl + K`) available at all times.
- Full keybinding support (`Tab`, `Shift + Tab`, `Enter`, `Escape`, `J`/`K` table navigation, `/` search focus).

#### Pillar 3: Sub-100ms Optimistic Feedback
- UI state updates immediately upon click (e.g., toggling employee status, approving leave).
- Background API synchronization handled seamlessly with automatic rollback toast on network failure.

#### Pillar 4: Progressive Disclosure Architecture
- Dashboards and tables present clean summaries.
- Clicking any row opens an **Inspector Drawer** or **Modal Sheet**, preserving primary navigation context without full page reloads.

#### Pillar 5: Predictable Shell Consistency
- Every module adheres strictly to the layout shell: Left Sidebar → Top Utility Navbar → Main Canvas → Right Inspector Drawer.

#### Pillar 6: Contextual Safety & Error Prevention
- Critical actions (e.g., "Execute Final Payroll Run", "Terminate Employee Account") feature 2-step verification modals with explicit keyword confirmation typing.

#### Pillar 7: Inclusive Accessibility (WCAG 2.1 AA+)
- Minimum text contrast ratio of 4.5:1 for normal text and 3:0:1 for UI borders.
- Visible, high-contrast outline focus rings (`2px solid var(--accent-primary)`) on all interactive elements.

---

## 4. Design Decisions & Rationale

- **Rejection of Infinite Scroll in Enterprise Tables**: Infinite scrolling creates severe accessibility issues and breaks data lookup predictability. Awais HR mandates virtualized paginated tables with fixed row heights and quick page jump inputs.
- **Inspector Drawer over Full Page Navigation**: Opening employee profiles or approval logs in a right slide-over drawer keeps the user in their active context, reducing task switching times by up to 40%.

---

## 5. Examples & Implementation Contracts

```jsx
// Keyboard Navigation & Action Binding Pattern
import { useHotkeys } from 'react-hotkeys-hook';

export function TableKeyboardController({ onNextRow, onPrevRow, onOpenInspector, onSelectAll }) {
  useHotkeys('j', () => onNextRow(), { enableOnFormTags: false });
  useHotkeys('k', () => onPrevRow(), { enableOnFormTags: false });
  useHotkeys('space', (e) => { e.preventDefault(); onOpenInspector(); });
  useHotkeys('meta+a', (e) => { e.preventDefault(); onSelectAll(); });

  return (
    <div className="text-xs text-[var(--text-muted)] flex gap-3 py-1">
      <span><kbd className="kbd">J</kbd>/<kbd className="kbd">K</kbd> Navigate</span>
      <span><kbd className="kbd">Space</kbd> Inspect</span>
      <span><kbd className="kbd">⌘A</kbd> Select All</span>
    </div>
  );
}
```

---

## 6. Best Practices

- **Never Disable Focus Styles**: Outline rings must remain visible when navigating via keyboard (`:focus-visible`).
- **Standardize Confirmation Modals**: Destructive action triggers must use red intent tokens (`--accent-danger`) and clear explanatory secondary text.

---

## 7. Future Considerations

- **AI-Powered Shortcut Suggestions**: Intelligent prompt bar predicting the user's next action based on recurring daily workflows.
