# 🏖️ Leave Application, Approval & Delegation Workflow Guide

> **Target Workspace**: E-Processing Systems (Pvt) Ltd — **OneLoad**  
> **Subdomain**: `awais`  
> **Default Staff Password**: `password123`  

---

## 📌 1. Overview & Core Architecture

The Leave Management System in Awais HR provides end-to-end time-off tracking, policy validation, multi-level approvals, and automated delegation handling when managers or approvers are away.

```
                      [ Employee Submits Leave Request ]
                                      │
                                      ▼
                   [ System Validates Policy & Days Balance ]
                                      │
                                      ▼
                      Is Direct Line Manager Available?
                                      │
                  ┌───────────────────┴───────────────────┐
                 YES                                     NO (Manager is on Leave)
                  │                                       │
                  ▼                                       ▼
        [ Line Manager Approves ]             [ Tier 1: Parent Dept Leader ]
        (e.g., Engineering Director)           Escalates up the Org Tree
                                                          │
                                                          ▼
                                              [ Tier 2: HR Manager Override ]
                                              (hr.chro@ep-systems.com / Zainab Ali)
                                                          │
                                                          ▼
                                              [ Tier 3: CEO / Admin Override ]
                                              (ceo@ep-systems.com in /approvals)
```

---

## 🔄 2. Leave Application Lifecycle

| Status State | Trigger / Action | Next Transition |
| :--- | :--- | :--- |
| **`PENDING`** | Employee submits leave request from `/leave-time`. | Awaits manager, HR, or admin approval. |
| **`APPROVED`** | Line Manager, HR, or CEO clicks **Approve**. | Leave balance deducted; calendar updated. |
| **`REJECTED`** | Approver clicks **Reject** with optional feedback. | Request closed; balance untouched. |
| **`DELETED / CANCELLED`** | Employee cancels request before approval. | Soft-deleted from active queue. |

---

## 📋 2.5. Leave Types, Annual Allowances & Balance Quotas

The system includes pre-configured leave categories with enforced quota calculations:

| Leave Type | Annual Allowance | Purpose / Policy Description | Quota Validation |
| :--- | :--- | :--- | :--- |
| **Annual Vacation** | **20 Days** | Paid standard annual vacation days allowance. | Hard stop when requested + used > 20 days. |
| **Casual Leave** | **10 Days** | Short-notice casual leave allowance for personal matters. | Hard stop when requested + used > 10 days. |
| **Sick Leave** | **12 Days** | Medical emergency paid leave allocation. | Hard stop when requested + used > 12 days. |
| **Field Duty Off** | **14 Days** | Compensatory time off for weekend merchant field drives. | Hard stop when requested + used > 14 days. |
| **Maternity Leave** | **90 Days** | Maternal care paid leave allocation for female staff. | Hard stop when requested + used > 90 days. |
| **Paternity Leave** | **14 Days** | Paternal support leave allocation for male staff. | Hard stop when requested + used > 14 days. |
| **Unpaid Leave / LOP**| **30 Days** | Loss of Pay uncompensated leave. | Tracked for payroll deduction calculation. |

### 🛠️ HR Policy Configuration API Endpoints
* **View Policies & Allowances**: `GET /api/v1/leaves/policies`
* **Create Custom Leave Policy (HR Admin)**: `POST /api/v1/leaves/policies` (`{"name": "Study Leave", "allowance": 10, "description": "Exam leave"}`)
* **Update Policy Allowance (HR Admin)**: `PUT /api/v1/leaves/policies/{id}` (`{"name": "Annual Vacation", "allowance": 24, "description": "Updated allowance"}`)
* **View Employee Balance Quota**: `GET /api/v1/leaves/balances` (Returns `policyName`, `allowance`, `usedDays`, `remainingDays`, `year`).
* **Trigger New Year Annual Reset**: `POST /api/v1/leaves/policies/year-end-reset`

---

## 🔄 2.6. Annual Balance Deduction & New Year Automatic Reset Engine

### 1. Dynamic Approval Deduction
When a leave request is marked **`APPROVED`** by a Manager, HR, or CEO:
$$\text{Remaining Balance} = \text{Annual Allowance} - \sum (\text{Approved Days in Active Calendar Year})$$
The employee's remaining quota immediately decreases on the dashboard UI.

### 2. Automatic New Year (Jan 1st) Reset
* All leave calculations execute with `YEAR(start_date) = YEAR(CURRENT_DATE())`.
* When **January 1st** arrives:
  * Prior year (e.g. 2026) leave deductions automatically archive.
  * The active year quota calculation switches to 2027.
  * Every employee's leave balance **automatically resets back to 100% full policy allowance** (e.g. 20 Annual, 12 Sick, 10 Casual days).

---

## 👥 3. Approval Hierarchy & Role Matrix

| Level / Role | Scope & Privileges | Key Seeded Accounts |
| :--- | :--- | :--- |
| **Level 1: Direct Line Manager** | Approves leave requests for team members within their department (`org_unit`). | • `eng.director@ep-systems.com` (Asad Mahmood)<br>• `line.manager@ep-systems.com` (Usman Khan)<br>• `architect@ep-systems.com` (Kamran Baig) |
| **Level 2: HR Operations (`HR_MANAGER`)** | Holds company-wide `leave:request:approve` permission. Can review & approve requests for any employee. | • `hr.chro@ep-systems.com` (Toima Asghar)<br>• `hr.manager@ep-systems.com` (Zainab Ali)<br>• `hr.bp@ep-systems.com` (Fatima Hassan) |
| **Level 3: Executive Admin (`TENANT_ADMIN`)** | Executive leadership with full administrative override in the Unified Approvals Center (`/approvals`). | • `ceo@ep-systems.com` (Muhammad Yar Hiraj)<br>• `tenant.admin@ep-systems.com` (Faizan Siddiqui) |

---

## 🚨 4. Absentee Manager Escalation Protocol (When Approver is on Leave)

If an employee's direct manager is **on leave** or unavailable, the system ensures requests are **never blocked** via a 3-tier fallback resolution:

1. **Hierarchy Escalation (Parent Org Unit Leader)**:
   * Requests escalate to the parent department leader defined in the organizational hierarchy tree (`parent_id` in `org_unit`).
2. **HR Operations Central Override**:
   * HR Managers (`hr.manager@ep-systems.com` / `hr.chro@ep-systems.com`) can process, approve, or reject any pending request across all departments.
3. **Executive Governance Override**:
   * The CEO (`ceo@ep-systems.com`) or Workspace Admin can review and action any pending request via the **Unified Approvals Center** (`/approvals`).

---

## 🧪 5. Hands-On Testing Step-by-Step

---

### **Scenario 1: Standard Employee Leave Request & Line Manager Approval**

#### **Step 1: Submit Leave Request as Staff Lead**
1. Open Workspace Portal: `http://awais.localhost:3000/login`
2. Log in as Senior Staff Lead **Hamza Riaz**:
   * **Email**: `lead.dev@ep-systems.com`
   * **Password**: `password123`
3. Navigate to **Leave & Time Off** (`/leave-time`).
4. Click **Apply for Leave**:
   * **Policy**: `Annual Vacation` (Allowance: 20 Days)
   * **Start Date**: Select tomorrow's date
   * **End Date**: Select date 3 days later
   * **Reason**: *"Attending tech conference & personal time off"*
5. Click **Submit Application**. Status displays **`PENDING`**.

#### **Step 2: Approve Leave as Engineering Director (Line Manager)**
1. Log out and log in as Engineering Director **Asad Mahmood**:
   * **Email**: `eng.director@ep-systems.com`
   * **Password**: `password123`
2. Navigate to **Unified Approvals** (`/approvals`) or **Leave Management**.
3. Locate Hamza Riaz's pending request.
4. Click **Approve**.
5. **Expected Result**: Status changes to **`APPROVED`** and deduction is recorded in the employee's vacation ledger.

---

### **Scenario 2: Manager on Leave — HR Fallback Override**

#### **Step 1: Submit Leave Request as Field Officer**
1. Log in as Field Merchant Specialist **Ali Raza**:
   * **Email**: `employee.john@ep-systems.com`
   * **Password**: `password123`
2. Navigate to `/leave-time`, click **Apply for Leave** (*Casual Leave*, 2 days), and submit.

#### **Step 2: Line Manager is Absent ➔ HR Overrides & Approves**
1. Since Sales Head `line.manager@ep-systems.com` is unavailable/on leave, log in as Head of HR Operations **Zainab Ali**:
   * **Email**: `hr.manager@ep-systems.com`
   * **Password**: `password123`
2. Navigate to **Leave Approvals** (`/leave-time`).
3. View Ali Raza's pending request and click **Approve**.
4. **Expected Result**: HR central override processes the request immediately with `approved_by` set to `hr.manager@ep-systems.com`.

---

### **Scenario 3: Executive Governance Override by CEO**

1. Log in as CEO **Muhammad Yar Hiraj**:
   * **Email**: `ceo@ep-systems.com`
   * **Password**: `password123`
2. Open **Unified Approvals Governance Center** (`/approvals`).
3. View company-wide pending leave requests across all departments (Engineering, HR, Sales, Finance).
4. **Expected Result**: CEO can action, approve, or reject any request with executive override privileges.
