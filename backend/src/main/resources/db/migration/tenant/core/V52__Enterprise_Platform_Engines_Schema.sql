-- Enterprise Platform Engines Schema
-- Idempotent schema additions for reusable engines across 25 industry verticals

-- 1. Certification & Credential Engine Table
CREATE TABLE IF NOT EXISTS certification_registry (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    certification_name VARCHAR(100) NOT NULL,
    credential_type VARCHAR(50) NOT NULL,
    authority_name VARCHAR(100),
    license_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(30) DEFAULT 'PENDING',
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Commission Rule Engine Table
CREATE TABLE IF NOT EXISTS commission_rule (
    id VARCHAR(50) PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    industry_code VARCHAR(50) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    target_amount DECIMAL(15, 2) DEFAULT 0.00,
    commission_rate DECIMAL(5, 2) NOT NULL,
    tier_multiplier DECIMAL(5, 2) DEFAULT 1.00,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Roster & Shift Market Engine Table
CREATE TABLE IF NOT EXISTS roster_shift_market (
    id VARCHAR(50) PRIMARY KEY,
    shift_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    department VARCHAR(50),
    required_qualification VARCHAR(100),
    assigned_employee_id VARCHAR(50),
    shift_status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, BIDDING, ASSIGNED, SWAPPED, COMPLETED
    trade_offered_by_id VARCHAR(50),
    trade_claimed_by_id VARCHAR(50),
    supervisor_approval VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Allowance & Mileage Engine Table
CREATE TABLE IF NOT EXISTS allowance_ledger (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    allowance_type VARCHAR(50) NOT NULL, -- MILEAGE_PER_KM, OFFSHORE_PER_DIEM, FIELD_STIPEND
    distance_km DECIMAL(10, 2) DEFAULT 0.00,
    unit_rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    trip_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Piece-Rate Output Engine Table
CREATE TABLE IF NOT EXISTS piece_rate_entry (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    production_unit VARCHAR(100) NOT NULL, -- HARVEST_KG, ROOM_CLEANED, ASSEMBLY_PART
    quantity INT NOT NULL,
    unit_rate DECIMAL(10, 2) NOT NULL,
    quality_factor DECIMAL(3, 2) DEFAULT 1.00,
    total_pay DECIMAL(15, 2) NOT NULL,
    work_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Integration Webhook Ledger Table
CREATE TABLE IF NOT EXISTS integration_webhook_event (
    id VARCHAR(50) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL, -- GITHUB, JIRA, POS, SAMSARA, HACKERRANK
    external_event_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PROCESSED',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_provider_event UNIQUE (provider, external_event_id)
);

-- 7. Maker-Checker Approval Request Table
CREATE TABLE IF NOT EXISTS maker_checker_request (
    id VARCHAR(50) PRIMARY KEY,
    request_type VARCHAR(50) NOT NULL, -- SALARY_REVISION, BANK_DISBURSEMENT, ROLE_PROMOTION
    maker_employee_id VARCHAR(50) NOT NULL,
    checker_employee_id VARCHAR(50),
    entity_id VARCHAR(50) NOT NULL,
    change_payload TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_CHECKER_APPROVAL',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actioned_at TIMESTAMP
);

-- 8. Plant Machinery Maintenance Responsibility Table
CREATE TABLE IF NOT EXISTS machinery_maintenance_task (
    id VARCHAR(50) PRIMARY KEY,
    machine_code VARCHAR(50) NOT NULL,
    machine_name VARCHAR(100) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL, -- DAILY_INSPECTION, CALIBRATION, OIL_CHANGE
    responsible_operator_id VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    completed_at TIMESTAMP
);

-- 9. POS Commission Ledger (Retail Module — persistent, not in-memory)
CREATE TABLE IF NOT EXISTS pos_commission (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    sales_amount DECIMAL(15, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(15, 2) NOT NULL,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_pos_entry UNIQUE (employee_id, log_date, sales_amount)
);

-- Performance indexes for engine tables
CREATE INDEX IF NOT EXISTS idx_piece_rate_employee ON piece_rate_entry (employee_id);
CREATE INDEX IF NOT EXISTS idx_piece_rate_unit ON piece_rate_entry (production_unit);
CREATE INDEX IF NOT EXISTS idx_allowance_employee ON allowance_ledger (employee_id);
CREATE INDEX IF NOT EXISTS idx_certification_employee ON certification_registry (employee_id);
CREATE INDEX IF NOT EXISTS idx_maker_checker_status ON maker_checker_request (status);
CREATE INDEX IF NOT EXISTS idx_roster_shift_dept ON roster_shift_market (department, shift_status);
