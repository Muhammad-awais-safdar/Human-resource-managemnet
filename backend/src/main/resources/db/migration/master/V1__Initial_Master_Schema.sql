-- Initial Master Schema creation script
CREATE TABLE IF NOT EXISTS tenant (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    custom_domain VARCHAR(100) UNIQUE,
    db_url VARCHAR(255) NOT NULL,
    db_username VARCHAR(100) NOT NULL,
    db_password VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS subscription (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenant(id) ON DELETE CASCADE,
    plan_tier VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    stripe_subscription_id VARCHAR(100) UNIQUE,
    seat_count INT NOT NULL DEFAULT 1,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
