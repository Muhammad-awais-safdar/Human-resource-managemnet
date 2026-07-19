# Frontend Engineering Standards: Awais HR

This document details the interface standards, component design rules, state management guidelines, and styling conventions for our frontend applications.

---

## 1. Component Rules & API Separation

*   **No API Call in JSX (Strict Rule):** You must **NEVER** call any API or make direct HTTP calls inside a JSX file. Always create a dedicated service class, API wrapper, or custom React Query hook. JSX must strictly serve layout and visual logic.
*   **React 19 Form Actions:** All form mutations must leverage React 19's native action capabilities. Use the `action` attribute on `<form>` tags bound to async functions rather than traditional `onSubmit` listeners.
*   **React 19 Action Hooks:** Leverage `useActionState` to track form validation states, database responses, and error messages, and `useFormStatus` to handle pending button states.
*   **React Compiler (React Forget) Optimization:** With React 19's automatic memoization compiler, developers should **not** write manual `useMemo` or `useCallback` optimizations unless specifically profiling a dynamic render hot path.
*   **Component Structure:** Components must be defined as standard JavaScript functions, declaring default properties at the function parameter level.

---

## 2. Styling (Vanilla CSS & OKLCH)

*   **Styling Engine:** We use Vanilla CSS with CSS Modules (`*.module.css`) to prevent global namespace collisions.
*   **Color Tokens:** Use OKLCH color variables defined in the global design system. Never use hardcoded hex (`#FFF`) or rgb values in custom component files.
*   **Responsive Layouts:** Use CSS Grid and Flexbox with relative sizing units (`rem`, `em`, `%`) and CSS container queries (`@container`) for responsive designs. Avoid hardcoded breakpoint pixel widths.

---

## 3. State Management & Accessibility

*   **Global State:** Use **Zustand** for lightweight, global client states (like theme toggles or current tenant context). Avoid Redux.
*   **Semantic Markup:** Use semantic HTML tags (`<main>`, `<section>`, `<article>`, `<header>`, `<nav>`) to ensure accessibility.
*   **A11y compliance:**
    *   Interactive elements must have unique, descriptive `id` values.
    *   Form controls must be explicitly associated with labels using `htmlFor`.
    *   Images must feature clear, descriptive `alt` tags.
