# 36 — High-Fidelity Visual Standards & Dark/Light Mock Specifications

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Visual UI Designers, Pixel-Perfect Frontend Engineers, Design System Leads
- **Cross-References**: `04_Color_System.md`, `06_Design_Tokens.md`, `09_Component_Library.md`, `35_Wireframe_Specifications.md`

---

## 1. Purpose

This document provides high-fidelity visual rendering specifications for Awais HR across Dark Mode and Light Mode display states.

---

## 2. Executive Overview

High-fidelity specifications translate structural wireframes into polished, pixel-perfect interfaces. This document details surface gradient specs, outer border glow rules, shadow elevations, glassmorphic blur values, and dynamic tenant white-label overrides.

---

## 3. Detailed Specifications

### 3.1 High-Fidelity Rendering Layer Contract

```
┌────────────────────────────────────────────────────────────────────────┐
│ HIGH-FIDELITY VISUAL RENDERING CONTRACT                                │
├─────────────────┬──────────────────────────────────────────────────────┤
│ SURFACE TIER    │ VISUAL RENDERING SPECIFICATION                       │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Base Canvas     │ `#0a0a0c` Dark / `#f8fafc` Light                      │
│ Primary Card    │ `#121216` Dark / `#ffffff` Light                     │
│ Card Border     │ `1px solid rgba(255,255,255,0.08)`                   │
│ Outer Shadow    │ `box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5)`         │
│ Backdrop Blur   │ `backdrop-filter: blur(16px)` on overlays & modals    │
│ Active Highlight│ `border-color: var(--accent-primary)`, subtle glow    │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Subtle Glassmorphic Elevation Layers**: Overlays use semi-transparent surface fills (`rgba(26,26,34,0.85)`) paired with `backdrop-filter: blur(16px)` to create realistic depth over underlying content.

---

## 5. Examples & Implementation Contracts

```css
/* High-Fidelity Card Styling Contract (dashboard.css) */
.glass-card-premium {
  background: rgba(18, 18, 22, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-premium:hover {
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 8px 30px -4px rgba(99, 102, 241, 0.2);
}
```

---

## 6. Best Practices

- **Never Use Blurry Shadows**: Ensure box-shadow blur radii are crisp and directional.
- **Maintain Pixel Precision**: Align all icon vectors and text baselines to whole pixel coordinates (`snap-to-pixel`).

---

## 7. Future Considerations

- **Real-Time HDR Color Profile Adaptation**: Utilizing Display P3 wide color gamut spaces on modern Apple Retina displays.
