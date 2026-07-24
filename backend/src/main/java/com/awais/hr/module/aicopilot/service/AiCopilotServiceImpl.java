package com.awais.hr.module.aicopilot.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class AiCopilotServiceImpl implements AiCopilotService {

    private static final Logger log = LoggerFactory.getLogger(AiCopilotServiceImpl.class);
    private final DataSource dataSource;

    public AiCopilotServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSessions() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, prompt, response, category, created_at FROM ai_copilot_session ORDER BY created_at DESC LIMIT 20");
    }

    @Override
    public Map<String, Object> askCopilot(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String prompt = (String) body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt is required.");
        }
        String category = body.get("category") != null ? (String) body.get("category") : "HR_ASSISTANT";
        String generatedResponse = "WorkForceOS AI Assistant: Processed prompt '" + prompt.trim() + "'. Recommendations generated based on tenant policy standards.";

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO ai_copilot_session (id, prompt, response, category) VALUES (?, ?, ?, ?)", id, prompt.trim(), generatedResponse, category);
        log.info("AI Copilot query processed: id={} prompt={}", id, prompt);
        return Map.of("id", id, "prompt", prompt, "response", generatedResponse, "category", category);
    }
}
