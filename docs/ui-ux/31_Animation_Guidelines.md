# 31 — Motion Design & Animation Physics Guidelines (Framer Motion & GSAP)

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Motion Designers, Frontend Engineers, Animation Architects
- **Cross-References**: `09_Component_Library.md`, `10_Layout_System.md`, `30_Micro_Interactions.md`

---

## 1. Purpose

This document specifies motion design parameters for Awais HR using **Framer Motion** and **GSAP**. It defines spring physics curves, page transition speeds, drawer slide timings, skeleton shimmer effects, and reduced-motion accessibility overrides.

---

## 2. Executive Overview

Animation in enterprise software should enhance spatial orientation rather than serve as decorative distraction. Awais HR enforces tight timing windows (150ms–250ms), custom spring physics curves (`stiffness: 400`, `damping: 30`), and mandatory `prefers-reduced-motion` compliance.

---

## 3. Detailed Specifications

### 3.1 Standard Motion Physics & Timing Parameters

```
┌────────────────────────────────────────────────────────────────────────┐
│ FRAMER MOTION PHYSICS MATRIX                                           │
├─────────────────┬──────────────────┬───────────────────────────────────┤
│ TRANSITION      │ DURATION / CURVE │ PARAMETERS / EASE                 │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ Modal Dialog Pop│ 200ms Spring     │ `stiffness: 400`, `damping: 25`   │
│ Drawer Slide    │ 250ms Smooth     │ `ease: [0.16, 1, 0.3, 1]`         │
│ Accordion Expand│ 200ms Cubic      │ `ease: [0.4, 0, 0.2, 1]`          │
│ Page Transition │ 150ms Fade       │ `initial: opacity 0`, `animate 1` │
│ Skeleton Pulse  │ 1500ms Infinite  │ `ease: easeInOut`, `opacity 0.4-1`│
└─────────────────┴──────────────────┴───────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Zero Layout Shifts during Expandables**: Accordion components animate height using `AnimatePresence` and `overflow-hidden`, preventing layout jumps in adjacent sidebar items.
- **GSAP Smooth Wheel Scrolling on Navigation**: Sidebar and layout viewports use GSAP smooth wheel listeners to provide fluid desktop scrolling.

---

## 5. Examples & Implementation Contracts

```jsx
// Modal Spring Animation Contract (Framer Motion)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-lg bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

---

## 6. Best Practices

- **Respect Reduced-Motion Settings**: Always check `useReducedMotion()` and bypass spatial animations for users who have requested reduced motion.
- **Never Animate Layout Width Directly**: Animate `transform` or `opacity` whenever possible to maintain 60 FPS GPU rendering performance.

---

## 7. Future Considerations

- **View Transitions API Integration**: Utilizing native browser View Transitions API for seamless cross-page element morphing on Chrome 111+.
