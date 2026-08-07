# 30 — Micro-Interactions, Feedback Loop & Optimistic UI Specifications

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Micro-Interaction Designers, Frontend Engineers, Motion Architects
- **Cross-References**: `09_Component_Library.md`, `31_Animation_Guidelines.md`, `32_Empty_Loading_Error_States.md`

---

## 1. Purpose

This document details micro-interaction specifications for Awais HR. It covers button click press states, hover transformations, optimistic state mutations, inline status checkmarks, and spring-physics toggle switches.

---

## 2. Executive Overview

Micro-interactions transform a static corporate web application into a responsive, high-craft software tool. In Awais HR, micro-interactions are subtle, intentional, and blazingly fast (<150ms execution time). They provide immediate tactile feedback when users perform daily tasks.

---

## 3. Detailed Specifications

### 3.1 Micro-Interaction Feedback Tiers

```
┌────────────────────────────────────────────────────────────────────────┐
│ MICRO-INTERACTION TIMING & BEHAVIOR MATRIX                             │
├─────────────────┬──────────────────┬───────────────────────────────────┤
│ INTERACTION     │ TIMING (MS)      │ VISUAL BEHAVIOR                   │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ Button Press    │ 50ms Active      │ Scale down 0.98 (`active:scale-98`)│
│ Toggle Switch   │ 150ms Ease-Out   │ Smooth pill slide + background glow│
│ Table Row Hover │ 100ms Linear     │ Background tint `#1a1a22` fill    │
│ Checkbox Select │ 120ms Spring     │ Icon checkmark stroke draw + scale│
│ Optimistic Save │ Instant 0ms      │ Checkmark toast + async API sync  │
└─────────────────┴──────────────────┴───────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Optimistic State Toggles**: Toggling an employee's active status or approving a leave request immediately updates the UI state. If the backend network call fails, the UI gracefully rolls back the state and triggers an error toast alert.

---

## 5. Examples & Implementation Contracts

```jsx
// Spring Toggle Switch Component Contract
import React from 'react';

export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
          checked ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-surface-l3)] border border-[var(--border-subtle)]'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>}
    </label>
  );
}
```

---

## 6. Best Practices

- **Never Delay Feedback**: Hover and active click states must respond instantly (<50ms) to input triggers.
- **Keep Scale Movements Subtle**: Scale animations should never exceed `1.02` on hover or drop below `0.98` on click.

---

## 7. Future Considerations

- **Haptic Vibration API Feedback**: Subtle haptic pulse triggers on mobile devices when approving critical workflows.
