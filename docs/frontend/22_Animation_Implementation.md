# 22 — Animation Engine: Framer Motion Springs & GSAP Physics Parameters

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Motion Engineers, Frontend Architects, Interaction Designers
- **Design System Cross-Reference**: `docs/ui-ux/30_Micro_Interactions.md`, `docs/ui-ux/31_Animation_Guidelines.md`

---

## 1. Purpose

This document specifies motion design implementation guidelines for **Awais HR** using **Framer Motion** and **GSAP**. It details spring physics parameters, modal transitions, accordion expandables, and reduced-motion user preference overrides.

---

## 2. Scope

This specification governs all UI animations, micro-interactions, page transition fades, drawer slide-overs, and drag gestures across desktop and mobile.

---

## 3. Standards & Physics Parameters

### 3.1 Framer Motion Physics Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ FRAMER MOTION SPRING PHYSICS MATRIX                                    │
├─────────────────┬──────────────────┬───────────────────────────────────┤
│ ANIMATION TYPE  │ TRANSITION MODEL │ PARAMETERS                        │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ Modal Pop       │ Spring           │ `stiffness: 400`, `damping: 30`   │
│ Sheet Slide     │ Smooth Ease-Out  │ `ease: [0.16, 1, 0.3, 1]`, 250ms  │
│ Accordion Expand│ Height Animate   │ `duration: 0.2`, `ease: easeOut`  │
│ Micro Press     │ Active Scale     │ `whileTap={{ scale: 0.98 }}`      │
│ Page Transition │ Opacity Fade     │ `initial: opacity 0`, `animate 1` │
└─────────────────┴──────────────────┴───────────────────────────────────┘
```

---

## 4. Folder Structure & Animation Directory

```
src/
├── styles/
│   └── animation.css               # Keyframe animations & transitions
└── utils/
    └── motionVariants.ts           # Shared Framer Motion variant curves
```

---

## 5. Naming Conventions

- **Motion Variants File**: `motionVariants.ts`.
- **Variant Objects**: camelCase ending in `Variants` (e.g. `modalVariants`, `fadeInVariants`).

---

## 6. Implementation Code Contracts

```typescript
// Shared Motion Variants Contract (src/utils/motionVariants.ts)
import { Variants } from 'framer-motion';

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { ease: [0.16, 1, 0.3, 1], duration: 0.25 },
  },
  exit: { x: '100%', transition: { duration: 0.2 } },
};
```

---

## 7. Best Practices

- **Respect Reduced-Motion Preferences**: Wrap Framer Motion elements or check `useReducedMotion()` to bypass spatial motion for users who prefer reduced motion.
- **Animate Hardware-Accelerated Properties Only**: Limit animations to `transform` (`scale`, `translate3d`) and `opacity` to avoid triggering browser layout recalculation frames.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** use `AnimatePresence` for unmounting animations on modals and drawers.
- **DO** keep micro-interaction response times under 150ms.

### Don'ts
- **DON'T** animate container `width` or `margin` directly during expandable accordion transitions.
- **DON'T** apply slow, sluggish spring durations (> 300ms) on daily operational screens.

---

## 9. Dependencies Reference

- `framer-motion`: `^11.0.0`
- `gsap`: Smooth scrolling and timeline orchestration driver

---

## 10. Implementation Notes

Animations are automatically disabled when running automated End-to-End Playwright test scripts to guarantee rapid test execution speeds.
