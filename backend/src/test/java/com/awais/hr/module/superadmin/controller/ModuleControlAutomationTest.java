package com.awais.hr.module.superadmin.controller;

import com.awais.hr.module.superadmin.service.ModuleManagementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ModuleControlAutomationTest {

    private MockMvc mockMvc;
    private ModuleManagementService moduleService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        moduleService = Mockito.mock(ModuleManagementService.class);
        ModuleManagementController controller = new ModuleManagementController(moduleService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        this.objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("SQA-TC-MOD-001: Get All Platform Modules Should Return 200 OK with Module List")
    void testGetAllModules() throws Exception {
        Mockito.when(moduleService.getAllModules()).thenReturn(List.of(
                Map.of("moduleKey", "RECRUITMENT", "name", "Recruitment & ATS", "isGloballyEnabled", true)
        ));

        mockMvc.perform(get("/api/v1/superadmin/modules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result[0].moduleKey").value("RECRUITMENT"));
    }

    @Test
    @DisplayName("SQA-TC-MOD-002: Toggle Global Module Status Should Return 200 OK")
    void testToggleGlobalModule() throws Exception {
        Mockito.when(moduleService.toggleGlobalModule(eq("RECRUITMENT"), eq(true)))
                .thenReturn(Map.of("moduleKey", "RECRUITMENT", "isGloballyEnabled", true, "updated", true));

        mockMvc.perform(put("/api/v1/superadmin/modules/RECRUITMENT/toggle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("enabled", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.updated").value(true));
    }

    @Test
    @DisplayName("SQA-TC-MOD-003: Set Tenant Module Override Should Return 200 OK")
    void testSetTenantModuleOverride() throws Exception {
        Mockito.when(moduleService.setTenantModuleOverride(eq("tenant_sqa_01"), eq("PAYROLL"), eq(false)))
                .thenReturn(Map.of("tenantId", "tenant_sqa_01", "moduleKey", "PAYROLL", "isEnabled", false));

        Map<String, Object> payload = Map.of(
                "tenantId", "tenant_sqa_01",
                "moduleKey", "PAYROLL",
                "enabled", false
        );

        mockMvc.perform(post("/api/v1/superadmin/modules/overrides")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result.isEnabled").value(false));
    }

    @Test
    @DisplayName("SQA-TC-MOD-004: Get Active Modules For Tenant Should Return 200 OK")
    void testGetActiveModulesForTenant() throws Exception {
        Mockito.when(moduleService.getActiveModulesForTenant(eq("sqa_subdomain")))
                .thenReturn(List.of("RECRUITMENT", "PAYROLL", "ATTENDANCE"));

        mockMvc.perform(get("/api/v1/tenants/active-modules")
                        .param("tenant", "sqa_subdomain"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.result[0]").value("RECRUITMENT"));
    }
}
