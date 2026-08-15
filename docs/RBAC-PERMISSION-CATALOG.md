# Master Permission Catalog & Feature Mapping

## 1. Core HR Module (`CORE_HR`)
| Feature | Action Key | Technical Permission Key | Human-Readable UI Label | Sensitive? |
| :--- | :--- | :--- | :--- | :--- |
| Employee Profiles | `READ` | `corehr:employee:read` | View employee directory and personal profiles | No |
| Employee Profiles | `WRITE` | `corehr:employee:write` | Create, update, and manage employee records | No |
| Org Structure | `WRITE` | `corehr:org:write` | Edit organizational chart and department hierarchy | No |
| Tenant Settings | `WRITE` | `corehr:settings:write` | Configure company branding, logo, and colors | No |

## 2. Payroll & Compensation Module (`PAYROLL`)
| Feature | Action Key | Technical Permission Key | Human-Readable UI Label | Sensitive? |
| :--- | :--- | :--- | :--- | :--- |
| Salary Records | `READ` | `payroll:salary:read` | View employee salary structures and payslips | No |
| Salary Calculations | `WRITE` | `payroll:salary:write` | Calculate monthly salaries and deductions | No |
| Payroll Approval | `APPROVE` | `payroll:salary:approve` | Approve final payroll runs for disbursement | ⚠️ Sensitive |
| Bank Disbursement | `PROCESS` | `payroll:salary:process` | Trigger automated SEPA / NACHA bank transfers | ⚠️ Sensitive |

## 3. Attendance & Workforce Module (`ATTENDANCE`)
| Feature | Action Key | Technical Permission Key | Human-Readable UI Label | Sensitive? |
| :--- | :--- | :--- | :--- | :--- |
| Clock-In Logs | `READ` | `attendance:log:read` | View daily attendance & biometric punch logs | No |
| Attendance Edits | `WRITE` | `attendance:log:write` | Adjust clock-in/out timestamps and overtime | No |
| Shift Scheduling | `WRITE` | `attendance:shift:write` | Create shift rosters and assign employee schedules | No |

## 4. Leave & Vacation Module (`LEAVE`)
| Feature | Action Key | Technical Permission Key | Human-Readable UI Label | Sensitive? |
| :--- | :--- | :--- | :--- | :--- |
| Leave Requests | `READ` | `leave:request:read` | View leave balances and time-off requests | No |
| Leave Approvals | `APPROVE` | `leave:request:approve` | Approve or reject employee vacation applications | No |

## 5. Performance & Reviews Module (`PERFORMANCE`)
| Feature | Action Key | Technical Permission Key | Human-Readable UI Label | Sensitive? |
| :--- | :--- | :--- | :--- | :--- |
| Review Appraisals | `READ` | `performance:review:read` | View employee KPI scorecards and appraisals | No |
| Review Appraisals | `WRITE` | `performance:review:write` | Submit annual manager performance appraisals | No |

## 6. Recruitment & ATS Module (`RECRUITMENT`)
| Feature | Action Key | Technical Permission Key | Human-Readable UI Label | Sensitive? |
| :--- | :--- | :--- | :--- | :--- |
| Job Openings | `WRITE` | `recruitment:job:write` | Publish job requisitions and candidate pipeline | No |
| Candidate Hires | `APPROVE` | `recruitment:hire:approve` | Issue official offer letters and approve hires | ⚠️ Sensitive |
