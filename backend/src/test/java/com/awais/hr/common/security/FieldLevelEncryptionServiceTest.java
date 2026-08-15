package com.awais.hr.common.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FieldLevelEncryptionServiceTest {

    private FieldLevelEncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        this.encryptionService = new FieldLevelEncryptionService();
    }

    @Test
    @DisplayName("Encrypt and Decrypt SSN - Should return original plaintext string")
    void shouldEncryptAndDecryptSsnCorrectly() {
        String plainSsn = "999-12-3456";

        String encrypted = encryptionService.encryptField(plainSsn);
        assertNotNull(encrypted);
        assertNotEquals(plainSsn, encrypted);

        String decrypted = encryptionService.decryptField(encrypted);
        assertEquals(plainSsn, decrypted);
    }

    @Test
    @DisplayName("Encrypt null or empty field - Should handle gracefully")
    void shouldHandleNullOrEmptyField() {
        assertNull(encryptionService.encryptField(null));
        assertEquals("", encryptionService.encryptField(""));
    }
}
