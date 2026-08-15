package com.awais.hr.module.manufacturing.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PieceRatePayrollControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        PieceRatePayrollController controller = new PieceRatePayrollController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/manufacturing/piece-rate/log - Should calculate output-based factory production wages")
    void shouldLogProductionUnitsAndCalculateWages() throws Exception {
        String jsonPayload = """
            {
                "employeeId": "EMP-FACTORY-88",
                "jobName": "Solar Panel Soldering",
                "unitsCompleted": 200,
                "ratePerUnit": 3.00
            }
            """;

        mockMvc.perform(post("/api/v1/manufacturing/piece-rate/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.logEntry.totalEarned").value(600.0))
                .andExpect(jsonPath("$.result.logEntry.unitsCompleted").value(200));
    }

    @Test
    @DisplayName("GET /api/v1/manufacturing/piece-rate/logs - Should return logged factory production entries")
    void shouldGetProductionLogs() throws Exception {
        mockMvc.perform(get("/api/v1/manufacturing/piece-rate/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }
}
