-- Migration V2: Platform Users, Roles, Permissions, and Support Impersonation Audit Schema
CREATE TABLE IF NOT EXISTS platform_user (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_role (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS platform_user_role (
    user_id VARCHAR(50) REFERENCES platform_user(id) ON DELETE CASCADE,
    role_id VARCHAR(50) REFERENCES platform_role(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS platform_permission (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS platform_role_permission (
    role_id VARCHAR(50) REFERENCES platform_role(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES platform_permission(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS platform_impersonation_log (
    id VARCHAR(50) PRIMARY KEY,
    impersonator_email VARCHAR(100) NOT NULL,
    target_tenant_id VARCHAR(50) NOT NULL,
    target_subdomain VARCHAR(50) NOT NULL,
    impersonated_role VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    ip_address VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS mfa_code (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
