-- Master Schema Migration V4: Dynamic Module Control & Feature Flags
CREATE TABLE IF NOT EXISTS platform_module (
    module_key VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'CORE' NOT NULL,
    description TEXT,
    is_globally_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_module_override (
    tenant_id VARCHAR(50) REFERENCES tenant(id) ON DELETE CASCADE,
    module_key VARCHAR(50) REFERENCES platform_module(module_key) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (tenant_id, module_key)
);

-- Seed Business Modules
INSERT INTO platform_module (module_key, name, category, description, is_globally_enabled) VALUES
('RECRUITMENT', 'Recruitment & ATS', 'TALENT', 'Applicant tracking, job postings, candidate pipelines, and AI resume parsing', true),
('PAYROLL', 'Payroll & Disbursements', 'FINANCE', 'Multi-currency payroll engine, batch salary payouts, and tax withholding', true),
('ATTENDANCE', 'Attendance & Shifts', 'WORKFORCE', 'Biometric tracking, shift rosters, geofenced clock-in, and overtime rules', true),
('EXPENSE', 'Expense Management', 'FINANCE', 'Expense reimbursement claims, policy thresholds, and OCR receipt parsing', true),
('ASSET', 'Asset Management', 'OPERATIONS', 'Hardware asset allocation, device tracking, and maintenance logs', true),
('PERFORMANCE', 'Performance & OKRs', 'TALENT', '360 appraisal reviews, OKR goal tracking, and merit matrices', true),
('LEARNING', 'LMS & Training', 'TALENT', 'Employee onboarding courses, certifications, and skill compliance', true),
('TICKET', 'Helpdesk & Ticketing', 'OPERATIONS', 'Internal IT/HR ticketing, SLA tracking, and issue resolution', true),
('SUCCESSION', 'Succession Planning', 'TALENT', '9-box talent grid, key role backups, and talent pipeline management', true),
('AICOPILOT', 'AI HR Assistant', 'INNOVATION', 'Natural language HR assistant, document summary, and predictive analytics', true),
('OBSERVABILITY', 'Observability Platform', 'SYSTEM', 'SRE metrics, Grafana dashboards, Loki log streaming, and telemetry', true)
ON CONFLICT (module_key) DO NOTHING;
