package com.awais.hr.module.recruitment;

import com.awais.hr.module.recruitment.service.ResumeParserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class ResumeParserServiceTest {

    private ResumeParserServiceImpl service;

    @BeforeEach
    public void setUp() {
        service = new ResumeParserServiceImpl();
    }

    @Test
    public void parseResume_shouldExtractSkillsAndPhone() {
        String resume = "Applicant Name: Alice. Cell: +923129876543. Skills: Java, Python, and SQL. Experience: 4 years working with REST APIs.";
        Map<String, String> result = service.parseResume(resume);

        assertEquals("+923129876543", result.get("phone"));
        assertEquals("4 years", result.get("experience"));
        assertTrue(result.get("skills").contains("Java"));
        assertTrue(result.get("skills").contains("Python"));
        assertTrue(result.get("skills").contains("SQL"));
        assertFalse(result.get("skills").contains("React"));
    }

    @Test
    public void parseResume_withNull_shouldReturnDefaultValues() {
        Map<String, String> result = service.parseResume(null);
        assertNull(result.get("phone"));
        assertEquals("", result.get("skills"));
        assertEquals("0 years", result.get("experience"));
    }
}
