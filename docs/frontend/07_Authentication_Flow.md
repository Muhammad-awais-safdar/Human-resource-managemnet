# 07 — Authentication Lifecycle, Session Management & 2FA Flow

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Auth Engineers, Frontend Engineers, Security Lead
- **Design System Cross-Reference**: `docs/ui-ux/02_Brand_Guidelines.md`, `docs/ui-ux/26_Notifications_UI.md`

---

## 1. Purpose

This document specifies the authentication lifecycle, login workflows, 2-Factor Authentication (2FA) verification, token refresh mechanisms, and session teardowns for **Awais HR**.

---

## 2. Scope

This specification governs all unauthenticated auth routes (`/login`, `/register`, `/verify-2fa`), token storage in HTTP-only cookies, auth state hydration, and automatic session logout on token expiration.

---

## 3. Standards & Auth Lifecycle

### 3.1 Authentication Lifecycle Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION LIFECYCLE                                               │
├─────────────────┬──────────────────────────────────────────────────────┤
│ STAGE           │ IMPLEMENTATION BEHAVIOR                              │
├─────────────────┼──────────────────────────────────────────────────────┤
│ Login           │ POST /api/v1/auth/login -> Receive JWT + 2FA Challenge│
│ 2FA Verification│ POST /api/v1/auth/verify-2fa -> Receive Session Token │
│ Token Storage   │ Access Token (Memory / Header), Refresh Token (Cookie)│
│ Silent Refresh   │ Axios 401 Interceptor triggers /api/v1/auth/refresh   │
│ Session Teardown│ POST /api/v1/auth/logout -> Clear Zustand & Cookies   │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & Auth Directory

```
src/
├── app/(auth)/
│   ├── login/page.tsx              # Login Screen
│   ├── verify-2fa/page.tsx         # 2FA Verification Screen
│   └── reset-password/page.tsx     # Password Reset Form
├── store/
│   └── useAuthStore.ts             # Auth Session State Store
└── services/
    └── authService.ts              # Authentication API Methods
```

---

## 5. Naming Conventions

- **Auth Screens**: PascalCase matching routes (`LoginView.tsx`, `Verify2FAView.tsx`).
- **Session Types**: `IUserSession`, `AuthTokenResponse`.

---

## 6. Implementation Code Contracts

```typescript
// Zustand Auth Store Contract (src/store/useAuthStore.ts)
import { create } from 'zustand';
import { authService } from '@/services/authService';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'SYSTEM_ADMIN' | 'TENANT_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';
  permissions: string[];
}

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: UserProfile, token: string) => void;
  refreshAccessToken: () => Promise<string>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setSession: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),

  refreshAccessToken: async () => {
    const res = await authService.refreshToken();
    set({ accessToken: res.accessToken });
    return res.accessToken;
  },

  logout: () => {
    authService.logout();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
```

---

## 7. Best Practices

- **Clear Session State on Logout**: Ensure Zustand store and query caches (`queryClient.clear()`) are completely reset upon user logout.
- **Support Session Timeout Warnings**: Prompt users with a countdown dialog when their session is 2 minutes from expiration.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** redirect users to their previous intended URL (`/login?redirect=/payroll`) after authenticating.
- **DO** validate 2FA input with real-time focus auto-advance across 6-digit pin boxes.

### Don'ts
- **DON'T** store sensitive user credentials or JWT tokens in unencrypted `localStorage`.
- **DON'T** reveal specific auth failure reasons (e.g. use *"Invalid email or password"* rather than *"Password incorrect"*).

---

## 9. Dependencies Reference

- `zustand`: Session memory management
- `cookies-next`: Edge cookie manipulation

---

## 10. Implementation Notes

Middleware inspects the `awais_auth_token` cookie on every request to protect route groups before page rendering occurs on the client.
