package com.awais.hr.module.industry.healthcare;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class HealthcareModuleControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        HealthcareModuleController controller = new HealthcareModuleController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/healthcare/shift-swaps/request - Should submit nurse shift trade request")
    void shouldRequestShiftSwap() throws Exception {
        String jsonPayload = """
            {
                "requestingNurse": "nurse.clara@hospital.org",
                "targetNurse": "nurse.bob@hospital.org",
                "shiftDate": "2026-08-20"
            }
            """;

        mockMvc.perform(post("/api/v1/healthcare/shift-swaps/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.request.status").value("PENDING_SUPERVISOR"));
    }

    @Test
    @DisplayName("GET /api/v1/healthcare/licenses/verify/{licenseNo} - Should return verified medical license details")
    void shouldVerifyMedicalLicense() throws Exception {
        mockMvc.perform(get("/api/v1/healthcare/licenses/verify/MD-998822"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.status").value("ACTIVE_VERIFIED"))
                .andExpect(jsonPath("$.result.licenseNumber").value("MD-998822"));
    }

    @Test
    @DisplayName("GET /api/v1/healthcare/gxp/matrix - Should return clinical laboratory qualification matrix")
    void shouldGetGxPMatrix() throws Exception {
        mockMvc.perform(get("/api/v1/healthcare/gxp/matrix"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }
}
