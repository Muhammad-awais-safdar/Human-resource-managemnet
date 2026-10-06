package com.awais.hr.module.auditcenter;

import java.util.Set;
import java.util.regex.Pattern;

public class AuditSanitizer {

    private static final Set<String> SENSITIVE_KEYS = Set.of(
            "password", "pass", "secret", "token", "jwt", "otp", "pin", "credit_card", "ssn", "cvv"
    );

    private static final Pattern KEY_VALUE_PATTERN = Pattern.compile(
            "(?i)\"(password|secret|token|jwt|otp|pin|credit_card|ssn|cvv)\"\\s*:\\s*\"[^\"]+\""
    );

    /**
     * Sanitize audit text inputs by redacting passwords, secrets, tokens, and sensitive keys.
     */
    public static String sanitize(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }

        String sanitized = input;
        // Redact JSON key-value pairs matching sensitive keys
        sanitized = KEY_VALUE_PATTERN.matcher(sanitized).replaceAll("\"$1\":\"[REDACTED]\"");

        return sanitized;
    }
}
