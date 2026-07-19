-- V10: Normalize table names for Phase 16-20 service layer consistency

-- Phase 17: Payroll - salary_structure must already exist from V9 or earlier
-- Phase 18: Peer Review table (consistent with PerformanceServiceImpl)
CREATE TABLE IF NOT EXISTS peer_review (
    id VARCHAR(50) PRIMARY KEY,
    reviewer_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    reviewee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Phase 19: Quiz table (consistent with LearningServiceImpl)
CREATE TABLE IF NOT EXISTS quiz (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES course(id) ON DELETE CASCADE,
    question VARCHAR(500) NOT NULL,
    option_a VARCHAR(200),
    option_b VARCHAR(200),
    option_c VARCHAR(200),
    option_d VARCHAR(200),
    correct_answer VARCHAR(1) NOT NULL
);

-- Add enrolled_at to course_enrollment if it doesn't exist
ALTER TABLE course_enrollment ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Phase 20: Asset inventory (consistent with AssetServiceImpl)
CREATE TABLE IF NOT EXISTS asset (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL' NOT NULL,
    serial_number VARCHAR(50) UNIQUE,
    status VARCHAR(30) DEFAULT 'AVAILABLE' NOT NULL,
    purchase_date DATE,
    assigned_to VARCHAR(50) REFERENCES employee(id) ON DELETE SET NULL
);

-- Seed sample assets
INSERT INTO asset (id, name, category, serial_number, status)
SELECT gen_random_uuid()::VARCHAR, 'Dell Laptop', 'LAPTOP', 'DL-2026-001', 'AVAILABLE'
WHERE NOT EXISTS (SELECT 1 FROM asset WHERE serial_number = 'DL-2026-001');

INSERT INTO asset (id, name, category, serial_number, status)
SELECT gen_random_uuid()::VARCHAR, 'iPhone 15', 'MOBILE', 'IP15-2026-001', 'AVAILABLE'
WHERE NOT EXISTS (SELECT 1 FROM asset WHERE serial_number = 'IP15-2026-001');

INSERT INTO asset (id, name, category, serial_number, status)
SELECT gen_random_uuid()::VARCHAR, 'Office Chair', 'FURNITURE', 'OC-2026-001', 'AVAILABLE'
WHERE NOT EXISTS (SELECT 1 FROM asset WHERE serial_number = 'OC-2026-001');
