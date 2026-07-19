# Rule: Frontend Development (React 19 & JSX)

This file details the interface design guidelines, component structures, state models, and styling conventions.

---

## 1. Component Rules & Separation

*   **No API Call in JSX (Strict Rule):** You must **NEVER** call any API or make direct HTTP calls inside a JSX/TSX file. Always create a dedicated service class, API wrapper, or custom hook. JSX must strictly serve layout and visual logic.
*   **React 19 Form Actions:** All form mutations must leverage React 19's native action capabilities. Use the `action` attribute on `<form>` tags bound to async functions.
*   **React 19 Action Hooks:** Leverage `useActionState` to track form validation states, database responses, and error messages, and `useFormStatus` to handle pending button states.
*   **React Compiler (React Forget) Optimization:** Do not write manual `useMemo` or `useCallback` optimizations unless specifically profiling a dynamic render hot path.

---

## 2. Styling Conventions (Vanilla CSS & OKLCH)

*   **Styling Engine:** We use Vanilla CSS with CSS Modules (`*.module.css`) to prevent global namespace collisions.
*   **Color Tokens:** Use OKLCH color variables defined in the global design system. Never use hardcoded hex (`#FFF`) or rgb values in custom component files.
*   **Responsive Layouts:** Use CSS Grid and Flexbox with relative sizing units (`rem`, `em`, `%`) and CSS container queries (`@container`). Avoid hardcoded breakpoint pixel widths.

---

## 3. State Management

*   **Global State:** Use **Zustand** for lightweight, global client states (like theme toggles or current tenant context). Avoid Redux.
*   **Local State:** Standardize on React's `useState` for local component rendering states.
