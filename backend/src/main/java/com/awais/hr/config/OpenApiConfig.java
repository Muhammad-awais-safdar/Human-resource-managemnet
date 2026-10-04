package com.awais.hr.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
                .info(new Info()
                        .title("Awais HR SaaS Platform - Microservice Core REST API")
                        .version("v1.0.0")
                        .description("""
                                ### Multi-Tenant Enterprise HR & Payroll SaaS Platform API Engine
                                
                                The Awais HR REST API provides enterprise endpoints for:
                                - **Authentication & Tenant Provisioning**: Multi-tenant login, MFA verification, workspace registration.
                                - **Employee 360 & Org Directory**: Profile management, department hierarchy, designational mapping.
                                - **Payroll & Disbursement**: Automated payroll calculations, bank disbursement pipelines.
                                - **Leave & Attendance**: Multi-level leave requests, accrual engines, approval workflows.
                                - **Recruitment & Applicant Tracking**: Job postings, candidate management, interview workflows.
                                - **Performance & Career Development**: Appraisal cycles, OKRs, goal tracking, promotion pipelines.
                                - **SuperAdmin Control Plane**: Tenant isolation monitoring, platform settings, security audit logs.
                                """)
                        .contact(new Contact()
                                .name("Awais HR Enterprise Engineering")
                                .email("admin@hrm.com")
                                .url("https://hrm.com"))
                        .license(new License()
                                .name("Proprietary Enterprise SaaS License")
                                .url("https://hrm.com/license")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api/v1").description("Local Development API Gateway (/api/v1)"),
                        new Server().url("http://awais.localhost:3000/api/v1").description("Tenant Workspace Proxy Gateway")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token to authorize API requests."))
                        .addParameters("X-Tenant-Subdomain", new Parameter()
                                .in("header")
                                .name("X-Tenant-Subdomain")
                                .description("Subdomain key of target tenant workspace (e.g. 'awais')")
                                .required(false)
                                .schema(new StringSchema()))
                        .addParameters("X-Tenant-ID", new Parameter()
                                .in("header")
                                .name("X-Tenant-ID")
                                .description("Unique UUID of target tenant workspace")
                                .required(false)
                                .schema(new StringSchema())));
    }
}
