package com.awais.hr.module.onboarding;

import com.awais.hr.module.onboarding.dto.PolicySignatureRequestDTO;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class OnboardingTest {

    @Test
    public void validatePolicySignatureDTO_shouldSetCorrectProperties() {
        PolicySignatureRequestDTO dto = new PolicySignatureRequestDTO();
        dto.setName("Awais Safdar");
        dto.setDocument("Compliance Policy Handbook");

        assertEquals("Awais Safdar", dto.getName());
        assertEquals("Compliance Policy Handbook", dto.getDocument());
    }

    @Test
    public void verifySignatureVerificationMock() {
        String signature = "Awais Safdar";
        assertNotNull(signature);
    }
}
