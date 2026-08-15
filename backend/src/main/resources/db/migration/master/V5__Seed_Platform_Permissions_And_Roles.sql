-- Master Schema Migration V5: Seed Platform Permissions, Roles, and Role-Permission Mappings

-- Seed Granular Platform Permissions
INSERT INTO platform_permission (id, name, description) VALUES
('perm_tenant_create', 'tenant:create', 'Ability to register and provision new enterprise tenants'),
('perm_tenant_suspend', 'tenant:suspend', 'Ability to suspend, activate, or terminate tenant workspaces'),
('perm_tenant_extend', 'tenant:extend', 'Ability to extend tenant subscription billing periods'),
('perm_module_feature_edit', 'module:feature_flag:edit', 'Ability to toggle global and per-tenant feature flags and modules'),
('perm_observability_view', 'observability:view', 'Access to SRE telemetry, Prometheus metrics, Loki logs, and Grafana'),
('perm_audit_export', 'audit:export', 'Ability to query and export global security audit logs'),
('perm_billing_override', 'billing:override', 'Ability to grant custom billing discounts and subscription plan changes'),
('perm_platform_rbac_manage', 'platform:rbac:manage', 'Ability to manage platform roles, permissions, and operator accounts'),
('perm_impersonate_tenant', 'impersonate:tenant', 'Ability to initiate support impersonation sessions into tenant workspaces')
ON CONFLICT (id) DO NOTHING;

-- Seed Standard Platform Roles
INSERT INTO platform_role (id, name, description) VALUES
('role_super_admin', 'SUPER_ADMIN', 'Full unrestricted platform owner access across all systems'),
('role_support_engineer', 'SUPPORT_ENGINEER', 'L2/L3 Customer Support Engineer with tenant inspection & read-only access'),
('role_finance_auditor', 'FINANCE_AUDITOR', 'Platform Finance Auditor with subscription billing & transaction visibility'),
('role_product_operator', 'PRODUCT_OPERATOR', 'Product Operator with feature flag control & release management')
ON CONFLICT (id) DO NOTHING;

-- Map Permissions to Roles
-- 1. SUPER_ADMIN gets all permissions
INSERT INTO platform_role_permission (role_id, permission_id) VALUES
('role_super_admin', 'perm_tenant_create'),
('role_super_admin', 'perm_tenant_suspend'),
('role_super_admin', 'perm_tenant_extend'),
('role_super_admin', 'perm_module_feature_edit'),
('role_super_admin', 'perm_observability_view'),
('role_super_admin', 'perm_audit_export'),
('role_super_admin', 'perm_billing_override'),
('role_super_admin', 'perm_platform_rbac_manage'),
('role_super_admin', 'perm_impersonate_tenant'),

-- 2. SUPPORT_ENGINEER
('role_support_engineer', 'perm_observability_view'),
('role_support_engineer', 'perm_audit_export'),
('role_support_engineer', 'perm_impersonate_tenant'),

-- 3. FINANCE_AUDITOR
('role_finance_auditor', 'perm_tenant_extend'),
('role_finance_auditor', 'perm_billing_override'),
('role_finance_auditor', 'perm_audit_export'),

-- 4. PRODUCT_OPERATOR
('role_product_operator', 'perm_module_feature_edit'),
('role_product_operator', 'perm_observability_view')
ON CONFLICT DO NOTHING;
