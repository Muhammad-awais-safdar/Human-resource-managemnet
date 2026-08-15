package com.awais.hr.module.industry.retail;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RetailModuleControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        RetailModuleController controller = new RetailModuleController();
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/retail/pos-commissions/log - Should calculate POS associate commission")
    void shouldLogPosCommission() throws Exception {
        String jsonPayload = """
            {
                "associateEmail": "clerk@store.com",
                "salesAmount": 2000.00,
                "commissionRate": 0.05
            }
            """;

        mockMvc.perform(post("/api/v1/retail/pos-commissions/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.commissionEntry.commissionEarned").value(100.0));
    }

    @Test
    @DisplayName("POST /api/v1/retail/shifts/generate-ai - Should generate demand-based AI shift roster")
    void shouldGenerateAiShiftRoster() throws Exception {
        String jsonPayload = """
            {
                "storeId": "STORE-CHICAGO-05",
                "expectedFootTraffic": 4200
            }
            """;

        mockMvc.perform(post("/api/v1/retail/shifts/generate-ai")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.recommendedShifts").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/retail/shifts/bidding-board - Should return available open shifts for bidding")
    void shouldGetBiddingBoard() throws Exception {
        mockMvc.perform(get("/api/v1/retail/shifts/bidding-board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result[0].status").value("OPEN_FOR_BID"));
    }
}
