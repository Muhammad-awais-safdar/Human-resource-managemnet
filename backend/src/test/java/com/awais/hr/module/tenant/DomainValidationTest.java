package com.awais.hr.module.tenant;

import org.junit.jupiter.api.Test;
import java.util.regex.Pattern;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class DomainValidationTest {

    private static final Pattern SUBDOMAIN_PATTERN = Pattern.compile("^[a-zA-Z0-9-]{3,30}$");

    @Test
    public void validateSubdomain_shouldAcceptValidSubdomains() {
        assertTrue(SUBDOMAIN_PATTERN.matcher("awais-hr").matches());
        assertTrue(SUBDOMAIN_PATTERN.matcher("mycompany123").matches());
    }

    @Test
    public void validateSubdomain_shouldRejectInvalidSubdomains() {
        assertFalse(SUBDOMAIN_PATTERN.matcher("ab").matches());
        assertFalse(SUBDOMAIN_PATTERN.matcher("a".repeat(31)).matches());
        assertFalse(SUBDOMAIN_PATTERN.matcher("awais.safdar").matches());
    }
}
