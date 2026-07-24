# Database Design Specification: Awais HR

This document details the database architecture, schema layouts, ERD mapping, indexing rules, migration pipelines, and audit strategies for the **Awais HR** platform.

---

## 1. Naming Conventions & Standards

*   **Database Engine:** PostgreSQL 16+.
*   **Case Style:** Lower snake_case (`first_name`, `tenant_id`).
*   **Table Names:** Singular nouns (`employee`, `department`, `leave_request`).
*   **Primary Keys:** Named `id` using random UUID v4 (`uuid DEFAULT gen_random_uuid()`).
*   **Foreign Keys:** `referenced_table_id` (`department_id` references `department.id`).
*   **Boolean Columns:** Prefix with `is_` or `has_` (`is_active`, `has_overtime`).
*   **Timestamp Columns:** Suffix with `_at` stored in UTC (`created_at`, `updated_at`).

---

## 2. Global System Columns & Soft Delete

Every table across master and tenant databases contains these auditing columns:

```sql
ALTER TABLE table_name ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE table_name ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE table_name ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE table_name ADD COLUMN created_by UUID;
ALTER TABLE table_name ADD COLUMN updated_by UUID;
ALTER TABLE table_name ADD COLUMN deleted_by UUID;
```

### Soft Delete Strategy
*   Soft-deleted records have `deleted_at` set to the timestamp of deletion.
*   All queries executed by the application ORM must append a filter: `WHERE deleted_at IS NULL`.
*   Unique indexes must include the soft delete filter to prevent collisions on historical records:
    ```sql
    CREATE UNIQUE INDEX uq_employee_email ON employee(email) WHERE (deleted_at IS NULL);
    ```

---

## 3. Master Database Schema

The Master database registers tenant connectivity, active domains, subscriptions, and modules.

```mermaid
erDiagram
    tenant ||--o{ tenant_domain : hosts
    tenant ||--o{ tenant_module : licenses
    tenant ||--|| subscription : bills
    module ||--o{ tenant_module : enables

    tenant {
        uuid id PK
        varchar company_name
        varchar db_host
        int db_port
        varchar db_name
        varchar db_username
        varchar db_password_encrypted
        varchar status
    }
    tenant_domain {
        uuid id PK
        uuid tenant_id FK
        varchar domain_name
        boolean is_primary
    }
    subscription {
        uuid id PK
        uuid tenant_id FK
        varchar tier
        varchar status
        timestamp current_period_end
    }
    module {
        uuid id PK
        varchar code
        varchar name
        boolean is_core
    }
    tenant_module {
        uuid id PK
        uuid tenant_id FK
        uuid module_id FK
        boolean is_enabled
    }
```

---

## 4. Tenant Database Schema

Every customer gets a tenant database containing these core tables.

### 4.1. Core HR module tables

```sql
CREATE TABLE permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_system BOOLEAN DEFAULT FALSE
);

CREATE TABLE role_permission (
    role_id UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permission(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    parent_department_id UUID REFERENCES department(id),
    manager_employee_id UUID, -- Setup later as dynamic circular FK
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

CREATE TABLE employee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Added credentials support
    phone VARCHAR(30),
    joining_date DATE NOT NULL,
    termination_date DATE,
    status VARCHAR(50) NOT NULL, -- ACTIVE, INACTIVE, SUSPENDED
    department_id UUID REFERENCES department(id),
    custom_metadata JSONB DEFAULT '{}'::jsonb, -- dynamic custom fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

CREATE TABLE employee_role (
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, role_id)
);

-- Complete circular dependency for department manager
ALTER TABLE department ADD CONSTRAINT fk_dept_manager FOREIGN KEY (manager_employee_id) REFERENCES employee(id);
```

### 4.2. Attendance & Leave module tables

```sql
CREATE TABLE leave_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL,
    accrual_days_per_year NUMERIC(5,2) NOT NULL,
    max_carry_forward NUMERIC(5,2) NOT NULL
);

CREATE TABLE leave_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employee(id),
    leave_type_id UUID NOT NULL REFERENCES leave_type(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(5,2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- PENDING, APPROVED, REJECTED
    reason TEXT,
    approved_by UUID REFERENCES employee(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE attendance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employee(id),
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    clock_in_ip VARCHAR(45),
    clock_out_ip VARCHAR(45),
    clock_in_latitude NUMERIC(10, 8),
    clock_in_longitude NUMERIC(11, 8),
    clock_out_latitude NUMERIC(10, 8),
    clock_out_longitude NUMERIC(11, 8),
    status VARCHAR(30) NOT NULL -- ON_TIME, LATE, MISSING_OUT
);
```

---

## 5. Audit Logging Architecture

We implement a dedicated, trigger-less, high-performance audit system. All write mutations (`INSERT`, `UPDATE`, `DELETE`) write to the `audit_trail` table inside the tenant DB via application Hibernate interceptors or Postgres triggers.

```sql
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID, -- Actor triggering the change
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_state JSONB, -- NULL on INSERT
    new_state JSONB, -- NULL on DELETE
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for compliance querying
CREATE INDEX idx_audit_table_record ON audit_trail(table_name, record_id);
CREATE INDEX idx_audit_employee ON audit_trail(employee_id);
```

---

## 6. Schema Migration & Deployment Strategy

*   **Migration Engine:** Flyway.
*   **Separation:** Migrations are segregated into folders:
    *   `db/migration/master/`: Schema setups for routing database.
    *   `db/migration/tenant/core/`: Baseline schema for all tenants.
    *   `db/migration/tenant/modules/{module_name}/`: Module-specific migrations.
*   **Migration Execution:** When a new tenant is provisioned, the provisioning engine runs Flyway against the newly created database target point. If an existing tenant purchases a new module, only the migrations inside `db/migration/tenant/modules/{module_name}/` are executed.

---

## 7. Enterprise Payment Framework Database Schemas

### 7.1. Master DB Schema: SaaS Subscription Billing (Payment Domain 1)

```sql
CREATE TABLE subscription_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- FREE_TRIAL, STARTER, PROFESSIONAL, ENTERPRISE, BUILD_YOUR_OWN
    name VARCHAR(100) NOT NULL,
    base_price_usd NUMERIC(12, 2) NOT NULL,
    per_seat_price_usd NUMERIC(12, 2) DEFAULT 0.00,
    billing_cycle VARCHAR(20) NOT NULL, -- MONTHLY, ANNUAL
    max_employees INT,
    max_storage_gb INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE billing_credit_note (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    credit_note_number VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    reason TEXT,
    status VARCHAR(30) DEFAULT 'ISSUED', -- ISSUED, APPLIED, VOID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE billing_refund (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    invoice_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    provider_refund_id VARCHAR(255),
    status VARCHAR(30) DEFAULT 'PROCESSED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE tenant_usage_metric (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- ACTIVE_SEATS, STORAGE_BYTES, API_CALLS
    quantity BIGINT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 7.2. Tenant DB Schema: Payroll Salary Disbursement (Payment Domain 2)

```sql
CREATE TABLE tenant_payment_credential (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code VARCHAR(50) NOT NULL, -- WISE, PAYONEER, ACH_DIRECT, SEPA_ISO20022, LOCAL_BANK
    environment VARCHAR(20) DEFAULT 'PRODUCTION', -- SANDBOX, PRODUCTION
    encrypted_api_key TEXT,
    encrypted_secret_key TEXT,
    encrypted_oauth_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE tenant_bank_account (
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

CREATE TABLE payroll_disbursement_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(150) NOT NULL,
    payroll_run_id UUID NOT NULL,
    provider_code VARCHAR(50) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    item_count INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, SUBMITTED, PROCESSING, COMPLETED, FAILED, PARTIAL
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    provider_batch_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE payroll_disbursement_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES payroll_disbursement_batch(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    bank_account_number_encrypted TEXT NOT NULL,
    bank_routing_code VARCHAR(50),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, DISBURSED, FAILED, RETURNED
    provider_transaction_ref VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE payroll_transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES payroll_disbursement_batch(id),
    event_type VARCHAR(50) NOT NULL, -- BATCH_CREATED, APPROVED, SUBMITTED_TO_PROVIDER, CALLBACK_RECEIVED, RECONCILED
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

