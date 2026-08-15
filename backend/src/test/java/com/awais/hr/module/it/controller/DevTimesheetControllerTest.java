package com.awais.hr.module.it.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DevTimesheetControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        DevTimesheetController controller = new DevTimesheetController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/integrations/dev-timesheet/jira/webhook - Should ingest Jira worklog successfully")
    void shouldIngestJiraWorklog() throws Exception {
        String jsonPayload = """
            {
                "issueKey": "ENG-204",
                "developerEmail": "sarah.dev@tech.com",
                "hoursLogged": 6.5,
                "description": "Refactored payment gateway integration"
            }
            """;

        mockMvc.perform(post("/api/v1/integrations/dev-timesheet/jira/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.entry.issueKey").value("ENG-204"))
                .andExpect(jsonPath("$.result.entry.hoursLogged").value(6.5));
    }

    @Test
    @DisplayName("POST /api/v1/integrations/dev-timesheet/git/commit - Should record Git commit into timesheet ledger")
    void shouldIngestGitCommit() throws Exception {
        String jsonPayload = """
            {
                "commitHash": "9f8e7d6c",
                "authorEmail": "sarah.dev@tech.com",
                "repository": "hr-core-service",
                "message": "feat: added piece-rate payroll calculator"
            }
            """;

        mockMvc.perform(post("/api/v1/integrations/dev-timesheet/git/commit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.entry.commitHash").value("9f8e7d6c"));
    }

    @Test
    @DisplayName("GET /api/v1/integrations/dev-timesheet/worklogs - Should return ingested developer worklogs")
    void shouldGetWorklogs() throws Exception {
        mockMvc.perform(get("/api/v1/integrations/dev-timesheet/worklogs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }
}
