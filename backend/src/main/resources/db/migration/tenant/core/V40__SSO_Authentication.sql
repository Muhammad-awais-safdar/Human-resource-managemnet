-- V40: SSO & Advanced Authentication

CREATE TABLE IF NOT EXISTS tenant_sso_config (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    idp_name            VARCHAR(50) NOT NULL DEFAULT 'OKTA', -- OKTA, AZURE_AD, GOOGLE_WORKSPACE, SAML_GENERIC
    sso_url             VARCHAR(255) NOT NULL,
    entity_id           VARCHAR(255) NOT NULL,
    is_enforced         BOOLEAN NOT NULL DEFAULT FALSE,
    scim_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sso_login_audit (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email               VARCHAR(100) NOT NULL,
    idp_provider        VARCHAR(50) NOT NULL,
    ip_address          VARCHAR(50),
    status              VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    logged_in_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
