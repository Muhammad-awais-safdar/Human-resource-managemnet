# 13 - Security Hardening & Access Control

## Security Guidelines
1. **Grafana Authentication**: Disable anonymous signup (`GF_USERS_ALLOW_SIGN_UP=false`). Change default admin password via environment variables `GF_SECURITY_ADMIN_PASSWORD`.
2. **Endpoint Protection**: Actuator management port can be restricted or bound to internal networks.
3. **Data Redaction**: Logback layout excludes sensitive PII fields (passwords, JWT tokens) from standard output streams.
