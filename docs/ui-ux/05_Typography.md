# 05 — Typographic Architecture & Text Scale Standards

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: UI Designers, Frontend Engineers, Type Specialists
- **Cross-References**: `04_Color_System.md`, `06_Design_Tokens.md`, `14_Table_Standards.md`

---

## 1. Purpose

This document defines the font stacks, typographic scale, line-height rules, letter-spacing properties, and tabular number standards for Awais HR. It ensures consistent hierarchy, legibility, and numeric precision across high-density enterprise interfaces.

---

## 2. Executive Overview

Typography in enterprise software serves as the primary conduit for complex information display. Awais HR uses **Inter** (with **Geist Mono** for code and numeric datasets). The typography system enforces tight, proportional line heights and mandatory tabular number formatting for numeric tables, financial figures, and timekeeping metrics.

---

## 3. Detailed Specifications

### 3.1 Primary Font Stack Hierarchy
```css
/* Primary UI Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace & Tabular Numeric Font Stack */
--font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2 Proportional Typographic Scale Matrix

| Size Token | Pixel / Rem | Weight | Line Height | Letter Spacing | Target Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `text-display` | `32px` / `2.0rem` | 700 (Bold) | 1.2 (`38px`) | `-0.025em` | Key metric stats, high-level headers |
| `text-h1` | `24px` / `1.5rem` | 700 (Bold) | 1.3 (`31px`) | `-0.02em` | Main page titles, modal headlines |
| `text-h2` | `20px` / `1.25rem`| 600 (Semi) | 1.35 (`27px`)| `-0.015em` | Card section titles, sub-headers |
| `text-h3` | `16px` / `1.0rem` | 600 (Semi) | 1.4 (`22px`) | `-0.01em` | Form section headings, drawer titles |
| `text-body-lg` | `15px` / `0.9375rem`| 400/500 | 1.5 (`22.5px`)| `normal` | Hero intro text, primary list items |
| `text-body` | `14px` / `0.875rem`| 400/500 | 1.45 (`20px`)| `normal` | Standard body text, form input copy |
| `text-body-sm` | `13px` / `0.8125rem`| 400/500 | 1.4 (`18px`) | `normal` | Table cell data, dense list metadata |
| `text-caption` | `12px` / `0.75rem` | 500 (Medium)| 1.35 (`16px`)| `+0.01em` | Badge labels, timestamp subtitles |
| `text-micro` | `11px` / `0.6875rem`| 700 (Bold) | 1.3 (`14px`) | `+0.05em` | All-caps section dividers, tag labels |

---

## 4. Design Decisions & Rationale

- **Mandatory Tabular Numbers (`tabular-nums`)**: Regular variable-width font numbers cause digit jittering when table cell figures update dynamically. Awais HR mandates `font-variant-numeric: tabular-nums` across all numeric and financial tables.
- **Controlled Text Truncation**: Text strings inside tight table cells or sidebar navigation links must enforce single-line truncation (`truncate`) with an explicit native `title` attribute for tooltip fallback.

---

## 5. Examples & Implementation Contracts

```jsx
// Typographic Component Wrapper Pattern
export function Heading({ level = 1, children, className = '' }) {
  const styles = {
    1: 'text-[24px] font-bold tracking-tight text-[var(--text-primary)] leading-tight',
    2: 'text-[20px] font-semibold tracking-tight text-[var(--text-primary)] leading-snug',
    3: 'text-[16px] font-semibold text-[var(--text-primary)] leading-normal',
  };
  const Tag = `h${level}`;
  return <Tag className={`${styles[level]} ${className}`}>{children}</Tag>;
}

export function NumericCell({ value, currency = 'USD' }) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  return (
    <span className="font-mono text-sm tracking-tight text-[var(--text-primary)] tabular-nums">
      {formatted}
    </span>
  );
}
```

---

## 6. Best Practices

- **Never Use Font Weights Below 400**: Light font weights (300/200) deteriorate rapidly on low-DPI displays and fail WCAG accessibility standards.
- **Maintain Proportional Line Heights**: Dense table text (`13px`) requires tighter line heights (`18px`) to prevent vertical cell stretching.

---

## 7. Future Considerations

- **Variable Font Integration**: Adopting variable font axes (`opsz` optical sizing) for fluid readability adjustments across high-DPI and standard display monitors.
