-- V13: Enhancements for Phases 21 to 25 (Expenses, Travel, Timesheets, Help Desk, and Documents)

-- 1. Phase 21: Expense claim receipt attachment support
ALTER TABLE expense_claim ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(255);

-- 2. Phase 22: Travel request purpose and approval context
ALTER TABLE travel_request ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE travel_request ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50);

-- 3. Phase 23: Resource Project Allocations and Timesheet statuses
CREATE TABLE IF NOT EXISTS project_allocation (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES project(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE timesheet_log ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING' NOT NULL;

-- 4. Phase 24: Support ticket assignee, priority, and Knowledge Base Articles
ALTER TABLE support_ticket ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(50) REFERENCES employee(id) ON DELETE SET NULL;
ALTER TABLE support_ticket ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL;

CREATE TABLE IF NOT EXISTS knowledge_base_article (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Phase 25: Document management signature verification and expiry tracking
ALTER TABLE document_record ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE document_record ADD COLUMN IF NOT EXISTS signed BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE document_record ADD COLUMN IF NOT EXISTS signature_data TEXT;
