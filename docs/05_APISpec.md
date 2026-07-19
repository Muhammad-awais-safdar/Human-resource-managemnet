# REST API Specification: Awais HR

This document details the REST API design standards, payload contracts, security parameters, and routing paths for the **Awais HR** platform.

---

## 1. REST Conventions & Standards

*   **Protocol:** HTTPS only.
*   **Base URL Structure:**
    *   Subdomain resolution: `https://{tenant}.awais-hr.com/api/${api.version}`
    *   Custom domain resolution: `https://hr.company.com/api/${api.version}`
*   **JSON Formatting:** CamelCase keys for request/response JSON payloads.
*   **URL Path casing:** kebab-case (`/leave-requests`, `/employee-profiles`).
*   **Version Pinning:** Enforced dynamically via Spring's `application.properties` configurations using the `api.version` property key (bound to context-path: `server.servlet.context-path=/api/${api.version}`).
*   **Standard Headers:**
    *   `Content-Type: application/json`
    *   `Accept: application/json`
    *   `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Rate Limiting & HTTP Response Headers

Rate limiting is enforced at the API Gateway layer based on the resolved Tenant Context ID.
*   **Rate Limits:**
    *   *Standard Tenant:* 100 requests/minute per client IP.
    *   *Enterprise Tenant:* 1,000 requests/minute per client IP.
*   **Response Headers:**
    ```http
    X-RateLimit-Limit: 1000
    X-RateLimit-Remaining: 994
    X-RateLimit-Reset: 1721245012
    ```

---

## 3. Global Response & Error Envelopes

### 3.1. Standard Success Response (Paginated)
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "size": 25,
    "totalElements": 150,
    "totalPages": 6
  },
  "timestamp": "2026-07-17T23:37:00Z"
}
```

### 3.2. Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request payload contains invalid parameters.",
    "details": [
      {
        "field": "email",
        "issue": "Must be a valid RFC 5322 email address format."
      }
    ]
  },
  "timestamp": "2026-07-17T23:37:00Z"
}
```

---

## 4. Endpoint Definitions & Payloads

### 4.1. Tenant Registration (Master Context)
Allows new companies to register via the primary homepage interface.

*   **Endpoint:** `POST https://awais-hr.com/api/${api.version}/tenants/register`
*   **Headers:**
    *   `X-Provision-Key: <SecureMasterAdminKey>`
*   **Request Payload:**
```json
{
  "companyName": "Acme Industries",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "industryTemplate": "IT_COMPANY",
  "planTier": "ENTERPRISE"
}
```
*   **Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "tenantId": "c928a3f8-45a7-47b2-bd7e-d009b0a1122a",
    "provisionStatus": "PROVISIONING_STARTED",
    "subdomainUrl": "https://acme.awais-hr.com"
  },
  "timestamp": "2026-07-17T23:37:00Z"
}
```

### 4.2. Authenticate & Log In (Tenant Context)
Validates credentials against the specific tenant context.

*   **Endpoint:** `POST https://{tenant}.awais-hr.com/api/${api.version}/auth/login`
*   **Request Payload:**
```json
{
  "email": "john.doe@acme.com",
  "password": "SecurePassword123!"
}
```
*   **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 86400,
    "tokenType": "Bearer",
    "employeeProfile": {
      "id": "e6a2b8e3-5182-411a-8c88-e219fbfa92da",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@acme.com",
      "roles": ["ROLE_HR_ADMIN"]
    }
  },
  "timestamp": "2026-07-17T23:37:00Z"
}
```

### 4.3. Employee Profiles (CRUD)
Manages employee database rows within the active tenant context.

*   **Endpoint:** `GET https://{tenant}.awais-hr.com/api/${api.version}/employees`
*   **Query Parameters:** `page=1&size=20&sort=lastName,asc&departmentId=d819b19e-4e4f-4d43-9877-e6f9a0c201a3`
*   **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "e6a2b8e3-5182-411a-8c88-e219fbfa92da",
      "employeeCode": "EMP-001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@acme.com",
      "joiningDate": "2026-01-15",
      "status": "ACTIVE",
      "department": {
        "id": "d819b19e-4e4f-4d43-9877-e6f9a0c201a3",
        "name": "Software Engineering"
      },
      "customMetadata": {
        "shirtSize": "L",
        "emergencyContact": "+1-555-0199"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  },
  "timestamp": "2026-07-17T23:37:00Z"
}
```

### 4.4. Attendance Clock-In
Updates biometric and geolocation timestamps.

*   **Endpoint:** `POST https://{tenant}.awais-hr.com/api/${api.version}/attendance/clock-in`
*   **Request Payload:**
```json
{
  "latitude": 37.774929,
  "longitude": -122.419416,
  "deviceSignature": "iPhone-15-Pro"
}
```
*   **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logId": "a988c8b4-023a-4db3-9821-ab9aef8902cd",
    "clockInTime": "2026-07-17T09:00:15Z",
    "status": "ON_TIME"
  },
  "timestamp": "2026-07-17T09:00:15Z"
}
```

### 4.5. Leave Request Submission
*   **Endpoint:** `POST https://{tenant}.awais-hr.com/api/${api.version}/leave/requests`
*   **Request Payload:**
```json
{
  "leaveTypeId": "l82b8b9e-4e4f-4d43-9877-e6f9a0c20188",
  "startDate": "2026-08-10",
  "endDate": "2026-08-14",
  "reason": "Family vacation plan"
}
```
*   **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "requestId": "r817a3f8-45a7-47b2-bd7e-d009b0a99887",
    "status": "PENDING_APPROVAL",
    "totalDays": 5.0
  },
  "timestamp": "2026-07-17T23:37:00Z"
}
```

### 4.6. Process Payroll Runs
*   **Endpoint:** `POST https://{tenant}.awais-hr.com/api/${api.version}/payroll/runs`
*   **Request Payload:**
```json
{
  "payPeriodId": "p812b19e-4e4f-4d43-9877-e6f9a0c20aaa",
  "notes": "Regular July 2026 Payroll execution cycle"
}
```
*   **Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "runId": "pr-817a3f8-45a7-47b2-bd7e-d009b0a9912a",
    "status": "PROCESSING",
    "etaSeconds": 15
  },
  "timestamp": "2026-07-17T23:37:00Z"
}
```
