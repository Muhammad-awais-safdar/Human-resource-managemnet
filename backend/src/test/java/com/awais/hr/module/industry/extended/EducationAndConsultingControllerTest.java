package com.awais.hr.module.industry.extended;

import com.awais.hr.module.industry.consulting.ConsultingModuleController;
import com.awais.hr.module.industry.education.EducationModuleController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EducationAndConsultingControllerTest {

    private MockMvc educationMockMvc;
    private MockMvc consultingMockMvc;

    @BeforeEach
    void setUp() {
        this.educationMockMvc = MockMvcBuilders.standaloneSetup(new EducationModuleController()).build();
        this.consultingMockMvc = MockMvcBuilders.standaloneSetup(new ConsultingModuleController()).build();
    }

    @Test
    @DisplayName("POST /api/v1/education/faculty/lecture-credits - Should calculate faculty lecture overload pay")
    void shouldCalculateFacultyOverloadPay() throws Exception {
        String jsonPayload = """
            {
                "professorEmail": "prof.alan@university.edu",
                "baseCreditHours": 12,
                "totalTeachingHours": 16,
                "overloadRate": 150.00
            }
            """;

        educationMockMvc.perform(post("/api/v1/education/faculty/lecture-credits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.overloadHours").value(4))
                .andExpect(jsonPath("$.result.overloadPay").value(600.0));
    }

    @Test
    @DisplayName("GET /api/v1/education/tenure-pipeline - Should return tenure review candidates")
    void shouldGetTenurePipeline() throws Exception {
        educationMockMvc.perform(get("/api/v1/education/tenure-pipeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/consulting/profit-share/calculate - Should calculate partner profit sharing")
    void shouldCalculatePartnerProfitSharing() throws Exception {
        String jsonPayload = """
            {
                "totalQuarterlyProfitPool": 1000000.00
            }
            """;

        consultingMockMvc.perform(post("/api/v1/consulting/profit-share/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.partnerAllocations").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/consulting/utilization-rate - Should return firm billable utilization metrics")
    void shouldGetConsultantUtilizationRate() throws Exception {
        consultingMockMvc.perform(get("/api/v1/consulting/utilization-rate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.firmAverageUtilization").value("84.2%"));
    }
}
