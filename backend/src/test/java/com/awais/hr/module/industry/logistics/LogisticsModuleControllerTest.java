package com.awais.hr.module.industry.logistics;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class LogisticsModuleControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        LogisticsModuleController controller = new LogisticsModuleController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/logistics/dot/validate-hours - Should flag DOT driving hours violation")
    void shouldFlagDotDrivingHoursViolation() throws Exception {
        String jsonPayload = """
            {
                "driverEmail": "driver.jack@fleet.com",
                "hoursDrivenToday": 12.5
            }
            """;

        mockMvc.perform(post("/api/v1/logistics/dot/validate-hours")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.complianceStatus").value("DOT_HOURS_VIOLATION_REST_REQUIRED"));
    }

    @Test
    @DisplayName("POST /api/v1/logistics/telematics/sync-samsara - Should sync Samsara GPS fleet mileage")
    void shouldSyncSamsaraTelematics() throws Exception {
        String jsonPayload = """
            {
                "vehicleId": "SEMI-TRUCK-10",
                "milesTraveled": 500.0,
                "engineRuntimeHours": 9.0
            }
            """;

        mockMvc.perform(post("/api/v1/logistics/telematics/sync-samsara")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.syncProvider").value("Samsara / Geotab Fleet API Gateway"));
    }

    @Test
    @DisplayName("POST /api/v1/logistics/trip-allowance/calculate - Should calculate per-km trip allowance")
    void shouldCalculateTripAllowance() throws Exception {
        String jsonPayload = """
            {
                "totalKm": 1000.0,
                "perKmRate": 0.40
            }
            """;

        mockMvc.perform(post("/api/v1/logistics/trip-allowance/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.totalTripAllowanceUsd").value(400.0));
    }
}
