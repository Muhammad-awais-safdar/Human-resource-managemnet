package com.awais.hr.module.recruitment.service;

import java.util.Map;

public interface ResumeParserService {
    Map<String, String> parseResume(String resumeText);
}
