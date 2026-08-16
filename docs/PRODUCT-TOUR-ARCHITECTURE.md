# Product Tour Architecture Documentation

## Overview

The Product Tour System is a data-driven guided workflow framework built natively into the Awais HR Enterprise SaaS application. It uses stable `data-tour` target attributes instead of fragile CSS selectors and respects RBAC permission boundaries.

---

## Core Components

1. **`ProductTourContext.jsx`**: Global tour state manager providing `startTour`, `nextStep`, `prevStep`, `skipTour`, `restartTour`, and completion persistence (`localStorage`).
2. **`TourRegistry.js`**: Centralized step registry categorizing tours (`welcome-overview`, `roles-rbac`, `employee-directory`, etc.).
3. **`ProductTourModal.jsx`**: Accessible floating popover highlighting target elements with `.tour-target-highlight` pulsing animations.

---

## Targeted Selectors (`data-tour`)

- `data-tour="header-tenant-switcher"`: Tenant workspace context
- `data-tour="sidebar-nav"`: Navigation links
- `data-tour="dashboard-kpis"`: Executive metric cards
- `data-tour="quick-actions"`: Operational quick action bar
- `data-tour="help-center-button"`: Help Center header button
- `data-tour="rbac-developer-toggle"`: Developer Key toggle button
- `data-tour="setup-checklist-widget"`: Workspace setup progress widget
