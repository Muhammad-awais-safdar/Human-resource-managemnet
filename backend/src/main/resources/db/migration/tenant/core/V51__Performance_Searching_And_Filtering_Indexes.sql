-- Tenant Schema Migration V51: Advanced Database Indexing for Fast Searching and Filtering
-- Prevents N+1 database queries and speeds up search/filter operations across HR domain tables

-- Core Employee Indexes
ALTER TABLE employee ADD COLUMN IF NOT EXISTS department_id VARCHAR(50);
ALTER TABLE employee ADD COLUMN IF NOT EXISTS org_unit_id VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_employee_status ON employee (status);
CREATE INDEX IF NOT EXISTS idx_employee_email ON employee (email);
CREATE INDEX IF NOT EXISTS idx_employee_dept ON employee (department_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_unit ON employee (org_unit_id);
CREATE INDEX IF NOT EXISTS idx_employee_search_name ON employee (first_name, last_name);

-- Attendance & Shift Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_emp_checkin ON attendance_record (employee_id, check_in);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_record (status);
CREATE INDEX IF NOT EXISTS idx_employee_shift_date ON employee_shift (employee_id, work_date);

-- Payroll & Disbursements Indexes
CREATE INDEX IF NOT EXISTS idx_payslip_emp_status ON payslip (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_disbursement_batch_status ON payroll_disbursement_batch (status);
CREATE INDEX IF NOT EXISTS idx_disbursement_item_emp ON payroll_disbursement_item (employee_id, status);

-- Recruitment & ATS Indexes
CREATE INDEX IF NOT EXISTS idx_candidate_application_email ON candidate_application (email);
CREATE INDEX IF NOT EXISTS idx_candidate_application_status ON candidate_application (status_stage);

-- Expense Claims & Approval Indexes
CREATE INDEX IF NOT EXISTS idx_expense_claim_emp_status ON expense_claim (employee_id, status);

