package com.awais.hr.module.employee;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class EmployeeInfoValidationTest {

    private boolean validateMetadataField(String key, String value) {
        if (key == null || key.trim().isEmpty() || key.length() > 50) return false;
        if (value == null || value.length() > 255) return false;
        return true;
    }

    @Test
    public void validateMetadataField_shouldAcceptValidFields() {
        assertTrue(validateMetadataField("blood_group", "O+"));
    }

    @Test
    public void validateMetadataField_shouldRejectLargeFields() {
        assertFalse(validateMetadataField("a".repeat(51), "val"));
        assertFalse(validateMetadataField("key", "a".repeat(256)));
    }
}
