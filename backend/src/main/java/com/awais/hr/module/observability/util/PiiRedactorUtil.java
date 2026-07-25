package com.awais.hr.module.observability.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PiiRedactorUtil {

    private static final Pattern SENSITIVE_JSON_PATTERN = Pattern.compile(
            "(?i)\"?(password|secret|token|jwt|accessToken|refreshToken|creditCard|cardNumber|ssn|cnic|cvv|pin|bankAccount|iban|salary)\"?\\s*[:=]\\s*\"?([^\",\\s}]+)\"?"
    );

    private static final Pattern CREDIT_CARD_PATTERN = Pattern.compile(
            "\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b"
    );

    private static final Pattern JWT_PATTERN = Pattern.compile(
            "\\beyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\b"
    );

    public static String redactSensitiveData(String message) {
        if (message == null || message.isBlank()) {
            return message;
        }

        // Redact JSON Key-Value pairs
        Matcher jsonMatcher = SENSITIVE_JSON_PATTERN.matcher(message);
        StringBuffer sb = new StringBuffer();
        while (jsonMatcher.find()) {
            String key = jsonMatcher.group(1);
            jsonMatcher.appendReplacement(sb, "\"" + key + "\":\"***REDACTED***\"");
        }
        jsonMatcher.appendTail(sb);
        String redacted = sb.toString();

        // Redact JWT Tokens
        redacted = JWT_PATTERN.matcher(redacted).replaceAll("eyJ***.***.***REDACTED***");

        // Redact Credit Cards
        redacted = CREDIT_CARD_PATTERN.matcher(redacted).replaceAll("****-****-****-****");

        return redacted;
    }
}
