-- Phase 12: Offboarding
CREATE TABLE IF NOT EXISTS resignation (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    resignation_date DATE NOT NULL,
    last_working_date DATE,
    reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL
);

-- Phase 14: Shift Management
CREATE TABLE IF NOT EXISTS shift_schedule (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS employee_shift (
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    shift_id VARCHAR(50) REFERENCES shift_schedule(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    PRIMARY KEY (employee_id, work_date)
);

-- Phase 16: Holiday Management
CREATE TABLE IF NOT EXISTS holiday (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    holiday_date DATE NOT NULL,
    description VARCHAR(255)
);

-- Phase 17: Payroll Engine
CREATE TABLE IF NOT EXISTS salary_structure (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    basic_salary NUMERIC(12,2) NOT NULL,
    allowance NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    deductions NUMERIC(12,2) DEFAULT 0.00 NOT NULL
);

CREATE TABLE IF NOT EXISTS payslip (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    pay_period VARCHAR(20) NOT NULL,
    net_salary NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID' NOT NULL
);

-- Phase 18: Performance Management
CREATE TABLE IF NOT EXISTS performance_goal (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    target_value INTEGER DEFAULT 100 NOT NULL,
    current_value INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' NOT NULL
);

-- Phase 19: Learning Management (LMS)
CREATE TABLE IF NOT EXISTS course (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS course_enrollment (
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES course(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ENROLLED' NOT NULL,
    PRIMARY KEY (employee_id, course_id)
);

-- Phase 21: Expense Management
CREATE TABLE IF NOT EXISTS expense_claim (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL
);

-- Phase 22: Travel Management
CREATE TABLE IF NOT EXISTS travel_request (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    destination VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL
);

-- Phase 23: Project & Timesheets
CREATE TABLE IF NOT EXISTS project (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS timesheet_log (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    project_id VARCHAR(50) REFERENCES project(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    hours_worked NUMERIC(4,2) NOT NULL
);

-- Phase 24: Help Desk
CREATE TABLE IF NOT EXISTS support_ticket (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL
);

-- Phase 25: Document Management
CREATE TABLE IF NOT EXISTS document_record (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
