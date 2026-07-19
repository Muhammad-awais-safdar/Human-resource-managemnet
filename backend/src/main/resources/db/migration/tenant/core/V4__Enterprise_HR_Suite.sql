-- Phase 6: Employee Lifecycle Timeline & Exit Clearance
CREATE TABLE IF NOT EXISTS employee_timeline (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- PROMOTION, TRANSFER, CONFIRMATION
    description VARCHAR(255),
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS exit_clearance (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    department_approved BOOLEAN DEFAULT FALSE NOT NULL,
    it_approved BOOLEAN DEFAULT FALSE NOT NULL,
    finance_approved BOOLEAN DEFAULT FALSE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL
);

-- Phase 7: Leave Policies & Attendance Records
CREATE TABLE IF NOT EXISTS leave_policy (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    allowance INTEGER NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS leave_request (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    leave_policy_id VARCHAR(50) REFERENCES leave_policy(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    approved_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS attendance_record (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP,
    ip_address VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20) DEFAULT 'PRESENT' NOT NULL
);

-- Phase 10: Recruitment (ATS)
CREATE TABLE IF NOT EXISTS job_requisition (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL,
    openings INTEGER DEFAULT 1 NOT NULL,
    salary_range VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS candidate_application (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) REFERENCES job_requisition(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    resume_url VARCHAR(255),
    status_stage VARCHAR(30) DEFAULT 'APPLIED' NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Phase 11: Welcome Onboarding & Assets
CREATE TABLE IF NOT EXISTS onboarding_task (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    task_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    status_completed BOOLEAN DEFAULT FALSE NOT NULL,
    due_date DATE
);

CREATE TABLE IF NOT EXISTS asset_allocation (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    asset_name VARCHAR(100) NOT NULL,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    allocated_at DATE DEFAULT CURRENT_DATE NOT NULL,
    returned_at DATE
);
