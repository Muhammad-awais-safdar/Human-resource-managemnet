# 42 — Figma Library Organization & Variant Property Taxonomy

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Figma Designers, Design System Leads, UI Component Authors
- **Cross-References**: `06_Design_Tokens.md`, `09_Component_Library.md`, `43_Design_System_Roadmap.md`

---

## 1. Purpose

This document details the Figma library structure, component variant property taxonomy, design token plugin synchronization, and page organization rules for Awais HR.

---

## 2. Executive Overview

To ensure seamless collaboration between designers and frontend engineers, the Figma workspace is structured to mirror the code repository 1:1. Component property names in Figma (`variant`, `size`, `state`, `isLoading`) use identical naming conventions as React component props.

---

## 3. Detailed Specifications

### 3.1 Figma Page Structure Taxonomy

```
❖ Awais HR Design System (Figma Library)
├── 01 | Cover & Quick Start
├── 02 | Design Tokens (Colors, Typography, Elevation)
├── 03 | Iconography & Vector Assets
├── 04 | Primitive Components (Buttons, Inputs, Badges)
├── 05 | Complex Components (Tables, Modals, Drawers)
├── 06 | Application Shell & Layout Templates
├── 07 | High-Fidelity Module Screen Flows
└── 08 | Archive & Exploration Scratchpad
```

---

## 4. Design Decisions & Rationale

- **Figma Variables to Tokens Sync**: Color and spacing variables in Figma are linked using the **Tokens Studio** plugin, automatically exporting changes as JSON to sync with `variables.css`.

---

## 5. Examples & Implementation Contracts

```
// Figma Variant Naming Mapping to React Props
Figma Component: "Button"
├── Variant: Primary | Secondary | Ghost | Danger | Outline
├── Size: Small (sm) | Medium (md) | Large (lg)
├── State: Default | Hover | Active | Disabled
└── Property: HasLeftIcon (Boolean) | IsLoading (Boolean)
```

---

## 6. Best Practices

- **Use Auto-Layout Everywhere**: Every frame, component, and page in Figma must enforce Auto-Layout to ensure responsive behavior.
- **Maintain Component Variants**: Use component variants rather than separate loose components to keep the library clean.

---

## 7. Future Considerations

- **Automated Figma-to-Code Asset Pipeline**: Continuous integration scripts auto-exporting SVG icons from Figma directly into React components.
