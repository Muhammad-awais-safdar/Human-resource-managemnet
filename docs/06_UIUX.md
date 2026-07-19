# UI/UX & Design System Specification: Awais HR

This document defines the interface design standards, token architecture, UX flows, animations, and micro-interactions for the **Awais HR** SaaS application.

---

## 1. Visual Philosophy & Art Direction

Awais HR features a high-end, premium dashboard layout. The visual theme uses:
*   **Glassmorphism & Depth:** Layered cards with frosted-glass backdrops (`backdrop-filter: blur(12px)`), thin borders, and soft shadows.
*   **Visual feedback:** Actionable buttons use spring-based micro-animations and color shifts rather than abrupt state swaps.
*   **Modern Typography:** Clean geometric sans-serif typefaces to ensure readability on high-DPI displays.

---

## 2. Design Tokens (OKLCH Color Palettes)

We use the CSS **OKLCH** color format for maximum color space resolution, consistent perception of brightness, and smooth gradients.

### 2.1. Light Mode Tokens
```css
:root {
  --color-bg-base: oklch(0.99 0.002 240);       /* Clean off-white */
  --color-bg-surface: oklch(0.97 0.005 240 / 0.7); /* Frosted surface */
  --color-border: oklch(0.90 0.005 240);
  
  --color-text-primary: oklch(0.15 0.01 240);
  --color-text-secondary: oklch(0.45 0.01 240);
  
  --color-primary: oklch(0.55 0.18 250);         /* Sleek Indigo/Blue */
  --color-primary-hover: oklch(0.50 0.20 250);
  --color-accent: oklch(0.68 0.16 310);          /* Magenta/Pink */
  
  --color-success: oklch(0.62 0.17 145);         /* Mint Green */
  --color-warning: oklch(0.78 0.15 75);          /* Muted Gold */
  --color-danger: oklch(0.57 0.19 25);           /* Soft Red/Crimson */
}
```

### 2.2. Dark Mode Tokens
```css
[data-theme="dark"] {
  --color-bg-base: oklch(0.12 0.01 240);         /* Deep slate/navy */
  --color-bg-surface: oklch(0.16 0.015 240 / 0.75); /* Card surface */
  --color-border: oklch(0.24 0.02 240);
  
  --color-text-primary: oklch(0.95 0.005 240);
  --color-text-secondary: oklch(0.70 0.01 240);
  
  --color-primary: oklch(0.65 0.17 250);
  --color-primary-hover: oklch(0.70 0.18 250);
  --color-accent: oklch(0.75 0.15 310);
  
  --color-success: oklch(0.72 0.16 145);
  --color-warning: oklch(0.82 0.14 75);
  --color-danger: oklch(0.65 0.18 25);
}
```

---

## 3. Typography Hierarchy

We use Google Fonts:
*   **Headings / Display:** **Outfit** (Geometric, friendly but authoritative).
*   **Body / Data Tables:** **Inter** (Excellent readability at small sizes, tabular figures support).

| Name | Font Family | Size | Weight | Line Height | Case / Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | Outfit | 2.5rem (40px) | 700 (Bold) | 1.15 | -0.02em |
| **H1** | Outfit | 1.75rem (28px) | 600 (Semi-Bold) | 1.25 | -0.01em |
| **H2** | Outfit | 1.35rem (22px) | 600 (Semi-Bold) | 1.3 | 0 |
| **Body Large** | Inter | 1.05rem (17px) | 400 (Regular) | 1.5 | 0 |
| **Body Main** | Inter | 0.875rem (14px)| 400 (Regular) | 1.5 | 0 |
| **Data Label**| Inter | 0.75rem (12px) | 600 (Semi-Bold) | 1.4 | +0.05em (UPPERCASE) |

---

## 4. UI Patterns & Key Screens

### 4.1. Core Application Layout
A split-screen design containing a persistent left sidebar and a flexible content zone:
*   **Sidebar:** Dynamic and collapsible. Icon-only on small tablets; fully labeled list on desktop. Includes tenant branding.
*   **Top Bar:** Search box, tenant picker, notification center, user profile avatar.
*   **Content Zone:** CSS Grid layout with responsive container query blocks.

### 4.2. Drag-and-Drop Shift Rostering Dashboard
For healthcare, restaurants, and manufacturing departments:
*   **Grid:** Columns = Days of the week; Rows = Department roles / employees.
*   **Interaction:** Cards can be dragged across slots using `@hello-pangea/dnd` or vanilla HTML5 drag-and-drop.
*   **Status Indicators:** Visual flags for overtime, scheduling conflicts (e.g., overlapping shifts, maximum hour violations).

```
+-------------------------------------------------------------------------+
| [Month View]  < July 2026 >                     [Publish Roster Button] |
+------------------+-----------------------+------------------------------+
| Employee         | Monday 17             | Tuesday 18                   |
+------------------+-----------------------+------------------------------+
| Elena Rostova    | [ Morning Shift ]     | [ Morning Shift ]            |
| (Warehouse Lead) | 08:00 - 16:00         | 08:00 - 16:00                |
+------------------+-----------------------+------------------------------+
| John Doe         | [ Night Shift - Over] | [ Rest Day ]                 |
| (Technician)     | 22:00 - 06:00 (+1)    |                              |
+------------------+-----------------------+------------------------------+
```

### 4.3. Interactive Workflow Builder
A canvas allowing HR Admins to create drag-and-drop approval logic chains:
*   **Nodes:** Trigger triggers (e.g., "Leave Request Created"), Condition blocks (e.g., "Requested Days > 5"), Action nodes ("Send Approval to VP").
*   **Style:** Minimal cards with animated connection arrows.

---

## 5. React 19 State-Driven Animations & Transitions

Awais HR leverages **React 19**'s state and rendering capabilities to orchestrate animations that reflect background processes, preventing jarring layout shifts.

### 5.1. Handling Action States with `useTransition`
Rather than displaying blocking full-screen loaders, we use React 19's concurrent transition triggers. Button states and data mutations run inside `useTransition`, providing immediate visual feedback:
*   **Pending State:** Button transitions to an active-pulse loading state, maintaining interactivity of the rest of the page.
*   **Implementation Pattern:**
    ```javascript
    import { useTransition } from 'react';

    const [isPending, startTransition] = useTransition();

    const handleClockIn = () => {
      startTransition(async () => {
        await api.clockIn();
        // UI shifts smoothly only after backend confirms state
      });
    };
    ```

### 5.2. Page Navigation with CSS View Transitions API
Next.js page transitions use the native web **View Transitions API** to morph layout frames:
```css
/* Enable view transitions between routing layouts */
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out;
}

::view-transition-new(root) {
  animation: 210ms cubic-bezier(0, 0, 0.2, 1) both fade-in;
}
```

### 5.3. Framer Motion Spring Presets (Perfect Physics-Based Motion)
For layout changes (like the collapsible sidebar, drag-and-drop schedules, and modal scales), we avoid linear timings. We enforce physics-based spring curves:

*   **Premium Elastic Spring (Modals / Cards Expansion):**
    ```javascript
    const elasticSpring = {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8
    };
    ```
*   **Gentle Fluid Spring (Sidebar Collapsing / Sliders):**
    ```javascript
    const fluidSpring = {
      type: "spring",
      stiffness: 220,
      damping: 28,
      mass: 1.0
    };
    ```

### 5.4. Active System Pulse Indicators
*   **Pulse Effect:** Elements like active biometric readers or live tracking geofences utilize a keyframe CSS pulse:
    ```css
    @keyframes status-pulse {
      0% { box-shadow: 0 0 0 0 oklch(0.72 0.16 145 / 0.5); }
      70% { box-shadow: 0 0 0 10px oklch(0.72 0.16 145 / 0); }
      100% { box-shadow: 0 0 0 0 oklch(0.72 0.16 145 / 0); }
    }
    .status-active-pulse {
      animation: status-pulse 2s infinite;
    }
    ```

