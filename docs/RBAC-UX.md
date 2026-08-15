# Enterprise RBAC User Experience & Design Specification

## 1. Design Philosophy: Human-First Administration
The upgraded RBAC dashboard bridges technical authorization with intuitive business language. Non-technical HR administrators can create custom roles, inspect employee capabilities, and assign permissions without exposure to database IDs, API paths, or raw technical permission keys.

---

## 2. Key UX Innovations

### 2.1 Progressive Disclosure Module Accordions
Permissions are grouped under parent feature modules (`Core HR`, `Payroll`, `Attendance`, `Leave`, `Recruitment`, `Audit`). Accordions expand and collapse on demand, preventing cognitive overload when configuring dense roles.

### 2.2 Human-Readable Capability Labels & Sensitive Badges
* Raw key `payroll:salary:approve` ➔ Displayed as **Approve Monthly Payroll Runs**.
* Sensitive operations (such as approving payroll or initiating bank transfers) display a clear **`⚠️ Sensitive`** badge to highlight high-risk privileges.

### 2.3 One-Click Batch Controls ("Select All" / "Clear All")
Administrators can select or clear an entire feature module for a role with a single click, automatically updating child permissions.

### 2.4 Effective Permissions Inspector
A dedicated tab allows administrators to enter an employee email and instantly view their combined capabilities across multiple assigned roles, complete with source role attribution (`Granted by: TENANT_ADMIN`).
