# 06 — API Integration, Axios Interceptors & Multi-Tenant Routing Headers

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Integration Engineers, Backend/Frontend Architects, Security Lead
- **Design System Cross-Reference**: `docs/ui-ux/02_Brand_Guidelines.md`, `docs/ui-ux/37_Frontend_Architecture.md`

---

## 1. Purpose

This document details the REST API integration architecture for **Awais HR**. It specifies Axios HTTP client configuration, multi-tenant header injection (`X-Tenant-ID`), automatic JWT token refresh, and standardized API error handling.

---

## 2. Scope

This specification applies to all client-side and server-side API requests originating from Next.js to the Spring Boot multi-tenant backend infrastructure.

---

## 3. Standards & API Contract

### 3.1 Multi-Tenant Request Contract
Every REST API request directed to the backend database routing context must inject the active tenant context header:
`X-Tenant-ID: [tenant_slug_or_uuid]`

### 3.2 Standard Envelope Response Structure
```typescript
export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
  timestamp: string;
}
```

---

## 4. Folder Structure & API Directory

```
src/services/
├── api.ts                          # Main Axios Instance & Interceptors
├── authService.ts                  # Authentication API Calls
├── tenantService.ts                # Tenant Configuration API Calls
├── employeeService.ts              # Employee Directory REST Services
└── payrollService.ts               # Payroll Engine REST Services
```

---

## 5. Naming Conventions

- **Service Files**: camelCase ending in `Service.ts` (e.g. `employeeService.ts`).
- **API Methods**: camelCase starting with action verb (e.g., `getEmployeeList`, `updatePayrollRun`, `deleteAsset`).

---

## 6. Implementation Code Contracts

```typescript
// Central Axios API Client Contract (src/services/api.ts)
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Inject Tenant ID & JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const tenantId = useTenantStore.getState().currentTenantId;
    const token = useAuthStore.getState().accessToken;

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatic 401 JWT Refresh Strategy
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Best Practices

- **Never Hardcode Base URLs**: Derive backend URLs from environment variables (`NEXT_PUBLIC_API_BASE_URL`).
- **Use DTO Adapters**: Transform raw backend JSON responses into typed frontend DTO models inside service methods.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** inject `X-Tenant-ID` on all API requests to ensure strict database routing isolation.
- **DO** handle network disconnects with retry policies in TanStack Query.

### Don'ts
- **DON'T** perform direct `fetch()` calls inside React components; route requests through service abstractions.
- **DON'T** store unencrypted JWT tokens in clear text `localStorage` if HTTP-only cookies are available.

---

## 9. Dependencies Reference

- `axios`: HTTP client with interceptor support

---

## 10. Implementation Notes

For server-side rendering (RSC), Next.js `headers()` must read `X-Tenant-ID` from incoming cookies or host subdomains and pass it explicitly to backend queries.
