package com.awais.hr.module.industry.bfsi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BFSIServicesControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        BFSIServicesController controller = new BFSIServicesController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/bfsi/bank-export/iso20022 - Should generate ISO 20022 direct bank disbursement XML")
    void shouldGenerateIso20022Xml() throws Exception {
        String jsonPayload = """
            {
                "batchId": "BATCH-AUG-2026",
                "totalDisbursement": 550000.00
            }
            """;

        mockMvc.perform(post("/api/v1/bfsi/bank-export/iso20022")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.format").value("ISO_20022_PAIN_001_XML"))
                .andExpect(jsonPath("$.result.iso20022XmlPayload").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/bfsi/maker-checker/requests - Should lock request pending dual-authorization")
    void shouldCreateMakerCheckerRequest() throws Exception {
        String jsonPayload = """
            {
                "makerEmail": "analyst@bank.com",
                "actionType": "BONUS_PAYOUT_REVISION",
                "targetEmployeeId": "EMP-FIN-10"
            }
            """;

        mockMvc.perform(post("/api/v1/bfsi/maker-checker/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.request.status").value("PENDING_CHECKER_APPROVAL"));
    }

    @Test
    @DisplayName("POST /api/v1/bfsi/leaves/validate-block-leave - Should enforce mandatory 10-day block leave policy")
    void shouldValidateBlockLeavePolicy() throws Exception {
        String jsonPayload = """
            {
                "consecutiveDays": 10
            }
            """;

        mockMvc.perform(post("/api/v1/bfsi/leaves/validate-block-leave")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.mandatoryBlockLeaveCompliant").value(true));
    }
}
