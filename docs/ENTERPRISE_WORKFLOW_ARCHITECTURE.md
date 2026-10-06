# Awais HR — Enterprise Workflow Hardening & SOC 2 Compliance Architecture

## 1. Executive Summary

The **Awais HR Engine** has undergone a multi-phase enterprise refactoring, establishing SOC 2 Type II compliance, state-machine workflow engines, Maker-Checker dual control integrity, period locking, exact monetary arithmetic, cross-department clearance engines, and declarative audit logging across all 65 functional modules.

---

## 2. Core Architectural Guarantees

### A. Dual Control Integrity (Maker-Checker)
Enforces strict $Maker \neq Checker$ protection across Salary Revisions, Payroll Approvals, Job Requisitions, and Delegations. Action initiators CANNOT approve or execute their own proposals.

### B. Period Locking & Ledger Immutability
Once a Payroll Run is transitioned to `LOCKED` or `DISBURSED`, database snapshot locking prevents any further calculations, edits, or line-item adjustments. Historical salary revisions write to `employee_salary_history` ledgers.

### C. Threshold-Based Multi-Tier Approvals
Expense claims are dynamically routed across approval tiers:
- Tier 1 ($\le \$500$): Line Manager.
- Tier 2 ($\le \$2,500$): Line Manager + Finance Admin.
- Tier 3 ($> \$2,500$): Line Manager + Finance Admin + CFO.
Self-approval is explicitly prohibited across all tiers.

### D. Cross-Department Clearance Task Engine
Offboarding finalization requires $100\%$ clearance task completion across IT, HR, Finance, and Facilities departments before an employee status can transition to `TERMINATED`.

### E. Declarative Security Audit Logging
Spring AOP `@Auditable` aspect redacts sensitive PII and secrets (`AuditSanitizer`) while logging immutable mutation events (`security_audit_log`) for SIEM and SOC 2 audits.

---

## 3. Flyway Database Migrations Registry (`V53`–`V64`)

| Version | Domain Module | Database Tables / Schema Updates | Purpose & Security Controls |
| :--- | :--- | :--- | :--- |
| **V53** | Central Workflow Engine | `workflow_definition`, `workflow_step`, `workflow_instance`, `workflow_task` | Core state machine transition graph & dynamic approver routing. |
| **V54** | Maker-Checker & Delegation | `maker_checker_request`, `approval_delegation` | Two-person integrity (`Maker != Checker`) & time-bound approval delegation. |
| **V55** | Security Audit Center | `security_audit_log` | Tamper-evident mutation logging with sensitive field masking. |
| **V56** | Leave Management | `leave_request_flow`, `leave_approval_history` | Multi-tier leave state machine & audit log. |
| **V57** | Employee Lifecycle | `employee_lifecycle_event` | Employee status lifecycle state machine & history ledger. |
| **V58** | Salary & Compensation | `employee_salary_history` | Salary revision Maker-Checker dual control & snapshot history ledger. |
| **V59** | Payroll Engine | `payroll_run`, `payslip_ledger` | Payroll state machine, period locking, exact decimal arithmetic & payslip snapshot ledger. |
| **V60** | Expense Management | `expense_approval_log` | Multi-tier threshold routing & self-approval protection log. |
| **V61** | Task Management | `project_task`, `task_status_history` | Project task lifecycle state machine & scoped permission audit log. |
| **V62** | Performance 360 | `performance_review_cycle`, `employee_appraisal_360`, `appraisal_cycle_log` | 360 appraisal cycle state machine & 1-5 rating scale validation. |
| **V63** | Recruitment ATS | `job_requisition` extensions, `candidate_stage_log` | ATS candidate pipeline & Maker-Checker requisition dual control. |
| **V64** | Onboarding / Offboarding | `employee_onboarding`, `employee_offboarding`, `cross_dept_clearance_task` | Cross-department clearance engine & lifecycle state machine guards. |

---

## 4. Module Workflow State Machines

```
LEAVE WORKFLOW:
SUBMITTED ──► PENDING_MANAGER ──► PENDING_HR ──► APPROVED ──► COMPLETED

EMPLOYEE LIFECYCLE WORKFLOW:
PROBATION ──► ACTIVE ──► NOTICE_PERIOD ──► TERMINATED / RESIGNED

PAYROLL ENGINE WORKFLOW:
DRAFT ──► CALCULATED ──► UNDER_REVIEW ──► APPROVED ──► LOCKED ──► DISBURSED

MULTI-TIER EXPENSE WORKFLOW:
SUBMITTED ──► TIER1_MANAGER ──► TIER2_FINANCE ──► TIER3_CFO ──► APPROVED ──► DISBURSED

TASK LIFECYCLE WORKFLOW:
BACKLOG ──► TODO ──► IN_PROGRESS ──► IN_REVIEW ──► COMPLETED

PERFORMANCE 360 WORKFLOW:
SELF_APPRAISAL ──► PEER_REVIEW ──► MANAGER_REVIEW ──► CALIBRATION ──► FINALIZED ──► ACKNOWLEDGED

RECRUITMENT ATS PIPELINE:
APPLIED ──► SCREENING ──► INTERVIEW_SCHEDULED ──► TECHNICAL_EVALUATION ──► OFFER_EXTENDED ──► HIRED

OFFBOARDING CLEARANCE WORKFLOW:
INITIATED ──► CLEARANCE_PENDING (IT, HR, Finance, Facilities) ──► COMPLETED ──► TERMINATED
```
