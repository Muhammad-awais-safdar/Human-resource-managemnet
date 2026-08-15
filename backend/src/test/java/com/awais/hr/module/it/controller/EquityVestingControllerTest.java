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

class EquityVestingControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        EquityVestingController controller = new EquityVestingController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/v1/equity/grants - Should return active equity option grants")
    void shouldGetAllEquityGrants() throws Exception {
        mockMvc.perform(get("/api/v1/equity/grants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/equity/grants - Should create new stock option grant")
    void shouldCreateEquityGrant() throws Exception {
        String jsonPayload = """
            {
                "employeeEmail": "tech.lead@startup.com",
                "grantNumber": "EQ-2026-99",
                "totalShares": 20000,
                "exercisePriceUsd": 2.50,
                "cliffMonths": 12,
                "vestingPeriodMonths": 48
            }
            """;

        mockMvc.perform(post("/api/v1/equity/grants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.grantNumber").value("EQ-2026-99"))
                .andExpect(jsonPath("$.result.totalShares").value(20000));
    }
}
