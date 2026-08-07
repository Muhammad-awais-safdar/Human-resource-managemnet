# 45 — Enterprise UI/UX Anti-Patterns & Prohibited Code Practices

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Frontend Engineers, Code Reviewers, Product Designers
- **Cross-References**: `06_Design_Tokens.md`, `39_UI_Coding_Standards.md`, `44_UI_UX_Best_Practices.md`

---

## 1. Purpose

This document details explicit UI/UX anti-patterns and prohibited code practices in Awais HR to prevent software degradation and bad user experiences.

---

## 2. Executive Overview

Preventing anti-patterns is just as critical as enforcing best practices. This specification details prohibited UI design patterns and code implementations that are automatically flagged during code reviews.

---

## 3. Detailed Specifications

### 3.1 Prohibited UI Anti-Pattern Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ PROHIBITED UI ANTI-PATTERN MATRIX                                      │
├─────────────────┬──────────────────────────────────────────────────────┤
│ ANTI-PATTERN    │ WHY IT IS FORBIDDEN & WHAT TO DO INSTEAD             │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Inline Styles   │ Breaks theme tokens. Use Tailwind classes/CSS vars.  │
│ Infinite Scroll │ Breaks data navigation in tables. Use pagination.    │
│ Hiding Actions  │ Hiding primary triggers in deep menus. Keep visible.  │
│ Custom Popups   │ Reinventing alerts. Use Radix UI Dialog / Toast system.│
│ Unmasked Data   │ Exposing raw bank/ID details. Mask behind reveal trigger.│
│ Raw Error Logs  │ Exposing stack traces to users. Show friendly error UI.│
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **No Infinite Scrolling in Data Tables**: Infinite scrolling creates disorientation when managing administrative records. Awais HR mandates virtualized paginated tables with clear page jump controls.

---

## 5. Examples & Implementation Contracts

```jsx
// ❌ PROHIBITED ANTI-PATTERN: Unmasked Sensitive Data
export function BadEmployeeData({ ssn }) {
  return <span>SSN: {ssn}</span>; // Raw SSN visible
}

// ✅ APPROVED PATTERN: Click-to-Reveal Sensitive Data
export function GoodEmployeeData({ ssn }) {
  const [show, setShow] = React.useState(false);
  return (
    <span onClick={() => setShow(!show)} className="cursor-pointer font-mono text-xs">
      SSN: {show ? ssn : '•••-••-••••'} <span className="text-[10px] text-[var(--accent-primary)]">{show ? '(Hide)' : '(Show)'}</span>
    </span>
  );
}
```

---

## 6. Best Practices

- **Flag Anti-Patterns Early**: Reject pull requests containing prohibited inline styles or unmasked data.
- **Maintain Code Quality**: Routinely review pull requests against this anti-pattern registry.

---

## 7. Future Considerations

- **Automated AST Anti-Pattern Scanner**: Static code analysis script flagging forbidden UI patterns before merge.
