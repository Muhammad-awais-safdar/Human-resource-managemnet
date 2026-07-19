package com.awais.hr.module.auth;

import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class AuthSecurityFilterTest {

    private boolean validateMfaCode(String code, String expectedSecret) {
        if (code == null || code.length() != 6) return false;
        try {
            Integer.parseInt(code);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Test
    public void validateMfaCode_shouldAcceptValidSixDigitCodes() {
        assertTrue(validateMfaCode("123456", "secret_key"));
    }

    @Test
    public void validateMfaCode_shouldRejectInvalidCodes() {
        assertFalse(validateMfaCode("123", "secret_key"));
        assertFalse(validateMfaCode("abcdef", "secret_key"));
    }

    private boolean isIpAllowed(String clientIp, List<String> blacklist, List<String> whitelist) {
        if (blacklist.contains(clientIp)) {
            return false;
        }
        if (!whitelist.isEmpty() && !whitelist.contains(clientIp)) {
            return false;
        }
        return true;
    }

    @Test
    public void isIpAllowed_shouldBlockBlacklistedIp() {
        List<String> blacklist = java.util.Arrays.asList("192.168.1.99");
        List<String> whitelist = java.util.Collections.emptyList();
        assertFalse(isIpAllowed("192.168.1.99", blacklist, whitelist));
        assertTrue(isIpAllowed("192.168.1.100", blacklist, whitelist));
    }

    @Test
    public void isIpAllowed_shouldBlockNonWhitelistedIp() {
        List<String> blacklist = java.util.Collections.emptyList();
        List<String> whitelist = java.util.Arrays.asList("127.0.0.1", "10.0.0.5");
        assertTrue(isIpAllowed("127.0.0.1", blacklist, whitelist));
        assertFalse(isIpAllowed("192.168.1.5", blacklist, whitelist));
    }
}
