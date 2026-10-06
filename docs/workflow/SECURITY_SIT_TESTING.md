# Awais HR — Security & SIT Automation Test Suite Architecture

## 1. Overview

Phase 19 establishes the **Enterprise Security & System Integration Testing (SIT) Suite** (`EnterpriseSecurityWorkflowSITTest.java`), validating SOC 2 compliance, dual-control integrity, immutability guards, and multi-tier state machines across all enterprise HR modules.

---

## 2. Tested Security & Integrity Guarantees

| SIT Test ID | Domain | Target Security Guard | Verified Behavior |
| :--- | :--- | :--- | :--- |
| **SIT-1** | Compensation & Requisitions | Maker-Checker Dual Control | Proposer cannot approve own salary revision or job requisition (`Maker != Checker`). |
| **SIT-2** | Expense Management | Self-Approval Protection | Submitter cannot approve own expense claim regardless of approval tier. |
| **SIT-3** | Payroll Engine | Period Lock Guard | Recalculation or deletion of `LOCKED` / `DISBURSED` payroll runs is rejected. |
| **SIT-4** | Offboarding Workflow | Cross-Dept Clearance Guard | Offboarding completion blocked if IT, HR, Finance, or Facilities tasks remain `PENDING`. |
| **SIT-5** | Performance 360 | Rating Scale Validation | Evaluation scores outside $[1, 5]$ scale throw `IllegalArgumentException`. |
| **SIT-6** | Monetary Arithmetic | Exact Decimal Calculations | `BigDecimal` used for all monetary calculations to prevent floating-point drift. |

---

## 3. Test Suite Reference

- **Class**: `com.awais.hr.security.EnterpriseSecurityWorkflowSITTest`
- **Location**: `backend/src/test/java/com/awais/hr/security/EnterpriseSecurityWorkflowSITTest.java`
- **Framework**: JUnit 5 / Mockito
