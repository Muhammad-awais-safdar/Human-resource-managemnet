package com.awais.hr.module.recruitment;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class RecruitmentAtsTest {

    private boolean isValidStageTransition(String currentStage, String targetStage) {
        if (currentStage == null || targetStage == null) return false;
        
        List<String> order = java.util.Arrays.asList("APPLIED", "SCREEN", "INTERVIEW", "OFFER");
        int currIndex = order.indexOf(currentStage);
        int targetIndex = order.indexOf(targetStage);
        
        if (currIndex == -1 || targetIndex == -1) return false;
        return Math.abs(targetIndex - currIndex) == 1;
    }

    @Test
    public void isValidStageTransition_shouldAcceptValidTransitions() {
        assertTrue(isValidStageTransition("APPLIED", "SCREEN"));
        assertTrue(isValidStageTransition("SCREEN", "INTERVIEW"));
        assertTrue(isValidStageTransition("INTERVIEW", "SCREEN"));
    }

    @Test
    public void isValidStageTransition_shouldRejectSkippingStages() {
        assertFalse(isValidStageTransition("APPLIED", "INTERVIEW"));
        assertFalse(isValidStageTransition("APPLIED", "OFFER"));
    }

    private String extractPhone(String text) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\+?\\d{10,13}").matcher(text);
        return m.find() ? m.group() : null;
    }

    private String extractSkills(String text) {
        java.util.List<String> found = new java.util.ArrayList<>();
        String[] stack = {"Java", "Spring Boot", "React", "SQL"};
        for (String s : stack) {
            if (text.toLowerCase().contains(s.toLowerCase())) {
                found.add(s);
            }
        }
        return String.join(", ", found);
    }

    private String extractExperience(String text) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\b(\\d+)\\s*(?:years?|yrs?)\\b", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
        return m.find() ? m.group(1) + " years" : "0 years";
    }

    @Test
    public void cvParsing_extractsDataCorrectly() {
        String cvText = "Candidate Profile: John Doe. Phone: +923001234567. Experience: 5 years in Java development, building Spring Boot microservices, writing SQL queries.";
        
        assertEquals("+923001234567", extractPhone(cvText));
        assertEquals("5 years", extractExperience(cvText));
        
        String skills = extractSkills(cvText);
        assertTrue(skills.contains("Java"));
        assertTrue(skills.contains("Spring Boot"));
        assertTrue(skills.contains("SQL"));
        assertFalse(skills.contains("React"));
    }
}
