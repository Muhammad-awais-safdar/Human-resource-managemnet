package com.awais.hr.common.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * AES-256 Field-Level Encryption Service for Sensitive Employee Data (SSN, Tax ID, Bank IBAN).
 */
@Service
@Slf4j
public class FieldLevelEncryptionService {

    // 256-bit AES master key spec (32 bytes)
    private static final byte[] MASTER_KEY_BYTES = "AwaisHREngineMasterAES256Key#99!".getBytes(StandardCharsets.UTF_8);

    public String encryptField(String plainText) {
        if (plainText == null || plainText.isBlank()) return plainText;
        try {
            SecretKeySpec secretKey = new SecretKeySpec(MASTER_KEY_BYTES, "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("[Field Encryption] Failed to encrypt sensitive field", e);
            throw new RuntimeException("Encryption error", e);
        }
    }

    public String decryptField(String cipherText) {
        if (cipherText == null || cipherText.isBlank()) return cipherText;
        try {
            SecretKeySpec secretKey = new SecretKeySpec(MASTER_KEY_BYTES, "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decoded = Base64.getDecoder().decode(cipherText);
            byte[] original = cipher.doFinal(decoded);
            return new String(original, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.warn("[Field Encryption] Decryption failed or unencrypted plain text string: {}", e.getMessage());
            return cipherText;
        }
    }
}
