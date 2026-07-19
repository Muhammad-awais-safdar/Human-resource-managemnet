-- V12: Secure Dynamic Database-Backed OTP Engine (Phase 4 MFA security enhancement)

CREATE TABLE IF NOT EXISTS mfa_code (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for quick lookups on active verification requests
CREATE INDEX IF NOT EXISTS idx_mfa_code_email_status ON mfa_code (email, used, expires_at);
