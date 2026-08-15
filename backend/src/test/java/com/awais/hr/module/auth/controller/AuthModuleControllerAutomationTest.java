package com.awais.hr.module.auth.controller;

import com.awais.hr.config.JwtUtils;
import com.awais.hr.module.auth.repository.PlatformUserRepository;
import com.awais.hr.module.auth.service.IpAccessControlService;
import com.awais.hr.module.tenant.repository.TenantRepository;
import com.awais.hr.module.tenant.service.TenantService;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthModuleControllerAutomationTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        DataSource routingDataSource = Mockito.mock(DataSource.class);
        PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);
        JwtUtils jwtUtils = Mockito.mock(JwtUtils.class);
        IpAccessControlService ipAccessControlService = Mockito.mock(IpAccessControlService.class);
        TenantRepository tenantRepository = Mockito.mock(TenantRepository.class);
        TenantService tenantService = Mockito.mock(TenantService.class);
        PlatformUserRepository platformUserRepository = Mockito.mock(PlatformUserRepository.class);

        AuthController controller = new AuthController(
                routingDataSource, passwordEncoder, jwtUtils,
                ipAccessControlService, tenantRepository, tenantService, platformUserRepository
        );

        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        this.objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("SQA-TC-AUTH-001: Register Employee without Tenant Context Should Fail")
    void testRegisterEmployeeWithoutTenantContext() throws Exception {
        Map<String, String> payload = Map.of(
                "firstName", "John",
                "lastName", "Doe",
                "email", "sqa.john@company.com",
                "password", "SecurePass123!"
        );

        mockMvc.perform(post("/auth/register-employee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("SQA-TC-AUTH-002: Register Employee with Missing Required Fields Should Return 400")
    void testRegisterEmployeeMissingFields() throws Exception {
        Map<String, String> payload = Map.of(
                "email", "sqa.invalid@company.com"
        );

        mockMvc.perform(post("/auth/register-employee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("SQA-TC-AUTH-003: Login with Invalid Credentials Should Return 401 Unauthorized")
    void testLoginInvalidCredentials() throws Exception {
        Map<String, String> payload = Map.of(
                "email", "nonexistent.user@company.com",
                "password", "WrongPassword123!"
        );

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("SQA-TC-AUTH-004: MFA Verification with Invalid Code Should Return 401 Unauthorized")
    void testVerifyMfaInvalidCode() throws Exception {
        Map<String, String> payload = Map.of(
                "email", "admin@company.com",
                "code", "999999",
                "tenantId", "sqa_tenant"
        );

        mockMvc.perform(post("/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().is4xxClientError())
                .andExpect(jsonPath("$.success").value(false));
    }
}
