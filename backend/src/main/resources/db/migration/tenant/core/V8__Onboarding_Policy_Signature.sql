-- Phase 11: Compliance Policy Signatures
CREATE TABLE IF NOT EXISTS onboarding_policy_signature (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    document VARCHAR(100) NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Phase 12: Resignation Extensions
ALTER TABLE resignation ADD COLUMN IF NOT EXISTS exit_interview_feedback TEXT;
ALTER TABLE resignation ADD COLUMN IF NOT EXISTS final_settlement_amount NUMERIC(12,2) DEFAULT 0.00;
