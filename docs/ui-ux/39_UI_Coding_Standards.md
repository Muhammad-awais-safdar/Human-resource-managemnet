# 39 — UI Coding Standards & Zero-Inline-Styles Enforcement

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Frontend Engineers, Code Reviewers, Lead Architects
- **Cross-References**: `06_Design_Tokens.md`, `37_Frontend_Architecture.md`, `45_UI_Anti_Patterns.md`

---

## 1. Purpose

This document defines UI coding standards for Awais HR. It enforces clean CSS variable integration, zero inline styles rule, Tailwind v4 class ordering, and ESLint rule configurations.

---

## 2. Executive Overview

Ad-hoc inline styles (e.g. `style={{ paddingLeft: '16px', color: '#facc15' }}`) pollute JSX code, break multi-tenant theme overrides, and degrade rendering performance. Awais HR strictly prohibits inline styles in production code, mandating Tailwind CSS v4 token utility classes or global CSS variables.

---

## 3. Detailed Specifications

### 3.1 Strict UI Coding Enforcement Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│ UI CODING ENFORCEMENT MATRIX                                           │
├─────────────────┬──────────────────────────────────────────────────────┤
│ RULE            │ SPECIFICATION & LINTING ENFORCEMENT                  │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Zero Inline     │ `style={{ ... }}` is FORBIDDEN in PR code reviews    │
│ Tailwind Token  │ Use CSS variables: `bg-[var(--bg-surface-l1)]`       │
│ Class Ordering  │ Layout -> Box Model -> Typography -> Visual -> State │
│ Component Size  │ Keep JSX files under 250 lines; extract sub-components│
│ Magic Numbers   │ No raw pixels; use design token scale (`space-4`)    │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **ESLint Rule Prohibition against `react/inline-styles`**: Automated ESLint errors prevent pull requests containing raw `style={{ ... }}` blocks from merging into main branches.

---

## 5. Examples & Implementation Contracts

```jsx
// ❌ BAD: Forbidden Inline Styles
export function BadCard() {
  return (
    <div style={{ backgroundColor: '#121216', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 style={{ color: '#f3f4f6', fontSize: '18px', fontWeight: 'bold' }}>Title</h3>
    </div>
  );
}

// ✅ GOOD: Standard Token Utility Classes
export function GoodCard() {
  return (
    <div className="bg-[var(--bg-surface-l1)] p-6 rounded-xl border border-[var(--border-subtle)]">
      <h3 className="text-[var(--text-primary)] text-lg font-bold">Title</h3>
    </div>
  );
}
```

---

## 6. Best Practices

- **Use `clsx` or `tailwind-merge`**: Use helper functions (`cn(...)`) when dynamically concatenating conditional class names.
- **Group Related Classes**: Order Tailwind utility classes logically (Layout → Spacing → Typography → Background → Border → Effects).

---

## 7. Future Considerations

- **Automated Stylelint Rule Engine**: Custom AST parser verifying that all CSS variables reference valid design tokens defined in `variables.css`.
