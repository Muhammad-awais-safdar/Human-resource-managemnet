package com.awais.hr.module.industry.hospitality;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class HospitalityModuleControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        HospitalityModuleController controller = new HospitalityModuleController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/hospitality/tips/calculate-pool - Should calculate tip pool distribution")
    void shouldCalculateTipPoolDistribution() throws Exception {
        String jsonPayload = """
            {
                "totalPosTips": 2000.00,
                "totalHoursWorked": 100
            }
            """;

        mockMvc.perform(post("/api/v1/hospitality/tips/calculate-pool")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.hourlyTipRate").value(20.0))
                .andExpect(jsonPath("$.result.tipPoolDistributions").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/hospitality/housekeeping/log-room - Should calculate room cleaning bonus pay")
    void shouldCalculateHousekeepingRoomBonus() throws Exception {
        String jsonPayload = """
            {
                "housekeeperEmail": "housekeeping.maria@hotel.com",
                "roomsCleaned": 20,
                "creditPerRoom": 8.00
            }
            """;

        mockMvc.perform(post("/api/v1/hospitality/housekeeping/log-room")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.totalBonusEarned").value(160.0));
    }
}
