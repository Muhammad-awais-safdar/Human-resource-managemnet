package com.awais.hr.module.industry.extended;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class IndustryVerticalsSuiteControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(new IndustryVerticalsSuiteController()).build();
    }

    @Test
    @DisplayName("POST /api/v1/verticals/insurance/commissions - Should calculate insurance commissions")
    void shouldCalculateInsuranceCommission() throws Exception {
        String jsonPayload = """
            {
                "premiumWritten": 50000.00,
                "commissionRate": 0.10
            }
            """;

        mockMvc.perform(post("/api/v1/verticals/insurance/commissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.commissionEarned").value(5000.0));
    }

    @Test
    @DisplayName("POST /api/v1/verticals/lifesciences/cfr21/e-sign - Should log FDA 21 CFR Part 11 signature")
    void shouldLogCfr21ElectronicSignature() throws Exception {
        String jsonPayload = """
            {
                "signerEmail": "qa.manager@pharma.com",
                "documentId": "SOP-100"
            }
            """;

        mockMvc.perform(post("/api/v1/verticals/lifesciences/cfr21/e-sign")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.cfrPart11Compliant").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/verticals/oilgas/rig-roster/generate - Should generate offshore rig rotation roster")
    void shouldGenerateRigRoster() throws Exception {
        String jsonPayload = """
            {
                "rigName": "Oceanic Titan Rig"
            }
            """;

        mockMvc.perform(post("/api/v1/verticals/oilgas/rig-roster/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.rotationSchedule").value("2 Weeks Onshore / 2 Weeks Offshore"));
    }

    @Test
    @DisplayName("GET /api/v1/verticals/aerospace/dod-clearances - Should return DoD defense clearances")
    void shouldGetDodClearances() throws Exception {
        mockMvc.perform(get("/api/v1/verticals/aerospace/dod-clearances"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/verticals/agriculture/crop-yield/log - Should calculate harvest piece rate")
    void shouldLogCropYield() throws Exception {
        String jsonPayload = """
            {
                "kgHarvested": 500.0,
                "ratePerKg": 0.50
            }
            """;

        mockMvc.perform(post("/api/v1/verticals/agriculture/crop-yield/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.totalHarvestPayUsd").value(250.0));
    }
}
