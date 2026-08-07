# 26 — Frontend Testing Strategy: Vitest, RTL & Playwright E2E

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Quality Engineers, Testing Authors, Frontend Engineers
- **Design System Cross-Reference**: `docs/ui-ux/40_Design_QA_Checklist.md`

---

## 1. Purpose

This document defines the comprehensive testing strategy for **Awais HR**. It details unit testing with **Vitest**, component testing with **React Testing Library (RTL)**, and End-to-End (E2E) automation with **Playwright**.

---

## 2. Scope

This specification governs test suite structure, mock servers (MSW), coverage thresholds, visual regression testing, and CI pipeline test execution.

---

## 3. Standards & Testing Pyramid

### 3.1 3-Tier Testing Pyramid Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND TESTING PYRAMID                                               │
├─────────────────┬──────────────────┬───────────────────────────────────┤
│ TEST LAYER      │ TOOLING ENGINE   │ TARGET COVERAGE OBJECTIVE         │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ Unit Tests      │ Vitest           │ > 85% Utilities, Hooks, Zod       │
│ Component Tests │ React Testing Lib│ > 75% Primitives & Complex Form UI│
│ E2E System Tests│ Playwright       │ 100% Critical User Journeys (Flows)│
└─────────────────┴──────────────────┴───────────────────────────────────┘
```

---

## 4. Folder Structure & Testing Directory

```
frontend/
├── __tests__/                      # Global Integration & Mock Files
│   ├── mocks/                      # MSW (Mock Service Worker) Handlers
│   │   ├── handlers.ts             # REST Endpoint Mock Handlers
│   │   └── server.ts               # MSW Server Setup
│   └── setupTests.ts               # Vitest Setup & Matchers
├── e2e/                            # Playwright E2E Test Suite
│   ├── auth.spec.ts                # Login & 2FA E2E Tests
│   ├── employee.spec.ts            # Employee Onboarding E2E Tests
│   └── payroll.spec.ts             # Payroll Wizard Execution E2E Tests
└── vitest.config.ts                # Vitest Configuration File
```

---

## 5. Naming Conventions

- **Unit/Component Tests**: `[ComponentName].test.tsx` or `[utilityName].test.ts`.
- **E2E Tests**: `[feature].spec.ts`.

---

## 6. Implementation Code Contracts

```typescript
// Component Unit Test Contract with React Testing Library (src/components/primitives/Button.test.tsx)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimaryButton } from './Button';

describe('PrimaryButton Component', () => {
  it('renders children text correctly', () => {
    render(<PrimaryButton>Submit</PrimaryButton>);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when isLoading is true', () => {
    render(<PrimaryButton isLoading>Submit</PrimaryButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 7. Best Practices

- **Test User Behavior, Not Implementation Details**: Select elements using accessible ARIA roles (`getByRole('button', { name: /save/i })`) rather than CSS classes or test IDs.
- **Use Mock Service Worker (MSW)**: Mock REST API calls using MSW to decouple tests from live backend environments.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** run `npm run test` before committing code to ensure zero test regressions.
- **DO** maintain Playwright E2E visual regression snapshots for core dashboard screens.

### Don'ts
- **DON'T** write brittle tests relying on deep DOM query selectors (`div > div > span`).
- **DON'T** skip accessibility checks (`axe-core`) inside Playwright E2E test runs.

---

## 9. Dependencies Reference

- `vitest`: Rapid Vite-native unit test runner
- `@testing-library/react`: React DOM testing utilities
- `msw`: Mock Service Worker API interception library
- `@playwright/test`: E2E browser automation test driver

---

## 10. Implementation Notes

Vitest runs automatically in watch mode during development (`npm run test:watch`), providing instant test feedback on file saves.
