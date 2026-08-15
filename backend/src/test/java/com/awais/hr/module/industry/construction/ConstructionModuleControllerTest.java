package com.awais.hr.module.industry.construction;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ConstructionModuleControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ConstructionModuleController controller = new ConstructionModuleController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/construction/weather-delay/check-trigger - Should trigger site pause on high winds")
    void shouldTriggerWeatherDelayPause() throws Exception {
        String jsonPayload = """
            {
                "siteLocation": "Site Beta - High Rise",
                "windSpeedMph": 48.0,
                "weatherCondition": "Gale Warning"
            }
            """;

        mockMvc.perform(post("/api/v1/construction/weather-delay/check-trigger")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.autoSitePauseTriggered").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/construction/gate-pass/generate-qr - Should generate subcontractor gate pass QR")
    void shouldGenerateSubcontractorGatePassQr() throws Exception {
        String jsonPayload = """
            {
                "subcontractorName": "Steel Works Inc",
                "workerName": "Dave Miller"
            }
            """;

        mockMvc.perform(post("/api/v1/construction/gate-pass/generate-qr")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.qrGatePassToken").isNotEmpty());
    }
}
