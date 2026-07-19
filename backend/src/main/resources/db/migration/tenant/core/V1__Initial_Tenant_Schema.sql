-- Initial Tenant-Specific Schema Setup
CREATE TABLE IF NOT EXISTS permission (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_permission (
    role_id VARCHAR(50) REFERENCES role(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES permission(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS employee (
    id VARCHAR(50) PRIMARY KEY,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT 'admin123' NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    joining_date DATE NOT NULL,
    custom_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS employee_role (
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    role_id VARCHAR(50) REFERENCES role(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, role_id)
);
