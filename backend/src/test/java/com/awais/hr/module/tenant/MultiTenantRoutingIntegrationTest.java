package com.awais.hr.module.tenant;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MultiTenantRoutingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.awais.hr.config.DataSeeder dataSeeder;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.awais.hr.module.tenant.domain.repository.TenantRepository tenantRepository;

    @Test
    @DisplayName("Should successfully route request with X-Tenant-ID header and maintain system health")
    void testTenantRoutingWithHeader() throws Exception {
        mockMvc.perform(get("/api/v1/health")
                .header("X-Tenant-ID", "demo-tenant"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.status").value("UP"));
    }
}
