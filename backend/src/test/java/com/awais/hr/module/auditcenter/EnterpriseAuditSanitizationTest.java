package com.awais.hr.module.auditcenter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EnterpriseAuditSanitizationTest {

    @Test
    @DisplayName("Audit Sanitizer: Redacts passwords, secrets, and JWT tokens from JSON strings")
    void testAuditSanitizer_redactsSensitiveFields() {
        String rawJson = "{\"username\":\"john.doe\", \"password\":\"SuperSecret123!\", \"token\":\"eyJhbGciOiJIUzI1NiJ9\"}";
        String sanitized = AuditSanitizer.sanitize(rawJson);

        assertNotNull(sanitized);
        assertFalse(sanitized.contains("SuperSecret123!"), "Password MUST be redacted!");
        assertFalse(sanitized.contains("eyJhbGciOiJIUzI1NiJ9"), "JWT Token MUST be redacted!");
        assertTrue(sanitized.contains("[REDACTED]"), "Redacted placeholder MUST be inserted!");
    }

    @Test
    @DisplayName("Audit Sanitizer: Handles null and blank inputs safely")
    void testAuditSanitizer_nullAndBlankInputs() {
        assertNull(AuditSanitizer.sanitize(null));
        assertEquals("", AuditSanitizer.sanitize(""));
        assertEquals("Normal non-sensitive details", AuditSanitizer.sanitize("Normal non-sensitive details"));
    }
}
