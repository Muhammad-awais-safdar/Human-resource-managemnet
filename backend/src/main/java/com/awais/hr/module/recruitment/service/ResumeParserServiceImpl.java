package com.awais.hr.module.recruitment.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ResumeParserServiceImpl implements ResumeParserService {

    @Override
    public Map<String, String> parseResume(String resumeText) {
        String phone = null;
        String skills = "";
        String experience = "0 years";

        if (resumeText != null && !resumeText.isEmpty()) {
            java.util.regex.Matcher phoneMatcher = java.util.regex.Pattern.compile("\\+?\\d{10,13}").matcher(resumeText);
            if (phoneMatcher.find()) {
                phone = phoneMatcher.group();
            }

            List<String> foundSkills = new ArrayList<>();
            String[] techStack = {"Java", "Spring Boot", "React", "SQL", "Python", "TypeScript", "Docker", "Kubernetes", "AWS", "CSS", "HTML"};
            for (String tech : techStack) {
                if (resumeText.toLowerCase().contains(tech.toLowerCase())) {
                    foundSkills.add(tech);
                }
            }
            if (!foundSkills.isEmpty()) {
                skills = String.join(", ", foundSkills);
            }

            java.util.regex.Matcher expMatcher = java.util.regex.Pattern.compile("\\b(\\d+)\\s*(?:years?|yrs?)\\b", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(resumeText);
            if (expMatcher.find()) {
                experience = expMatcher.group(1) + " years";
            }
        }

        Map<String, String> result = new HashMap<>();
        result.put("phone", phone);
        result.put("skills", skills);
        result.put("experience", experience);
        return result;
    }
}
