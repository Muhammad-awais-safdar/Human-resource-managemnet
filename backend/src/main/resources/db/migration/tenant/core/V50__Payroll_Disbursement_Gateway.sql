-- V50__Payroll_Disbursement_Gateway.sql
-- Tenant Schema setup for Multi-Bank Payroll Salary Disbursement Engine (Payment Domain 2)

CREATE TABLE IF NOT EXISTS tenant_payment_credential (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code VARCHAR(50) NOT NULL, -- WISE, PAYONEER, ACH_DIRECT, SEPA_ISO20022, LOCAL_BANK
    environment VARCHAR(20) DEFAULT 'PRODUCTION',
    encrypted_api_key TEXT,
    encrypted_secret_key TEXT,
    encrypted_oauth_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_bank_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(100) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    routing_number_encrypted TEXT,
    iban_encrypted TEXT,
    swift_bic VARCHAR(20),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll_disbursement_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(150) NOT NULL,
    payroll_run_id VARCHAR(100) NOT NULL,
    provider_code VARCHAR(50) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    item_count INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    provider_batch_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll_disbursement_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES payroll_disbursement_batch(id) ON DELETE CASCADE,
    employee_id VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    bank_account_number_encrypted TEXT NOT NULL,
    bank_routing_code VARCHAR(50),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(30) DEFAULT 'PENDING',
    provider_transaction_ref VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll_transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES payroll_disbursement_batch(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
