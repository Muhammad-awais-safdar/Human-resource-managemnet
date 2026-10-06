package com.awais.hr.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
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
        final String bearerSchemeName = "bearerAuth";
        final String tenantSchemeName = "tenantSubdomainHeader";

        return new OpenAPI()
                .info(new Info()
                        .title("Awais Enterprise Multi-Tenant HR Engine REST API")
                        .version("v1.0.0")
                        .description("Production-grade OpenAPI documentation for Awais Multi-tenant HR SaaS. " +
                                "Supports dynamic schema-per-tenant routing, JWT authentication, " +
                                "Organization Chart management, Employee Lifecycle 360, Payroll & Attendance Engine.")
                        .contact(new Contact()
                                .name("Engineering & Architecture Team")
                                .email("support@ep-systems.com")
                                .url("https://ep-systems.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api/v1").description("Local Development API Gateway v1"),
                        new Server().url("http://awais.localhost:8080/api/v1").description("Tenant Awais Subdomain Gateway")
                ))
                .addSecurityItem(new SecurityRequirement().addList(bearerSchemeName).addList(tenantSchemeName))
                .components(new Components()
                        .addSecuritySchemes(bearerSchemeName,
                                new SecurityScheme()
                                        .name(bearerSchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT authorization bearer token obtained from POST /auth/login"))
                        .addSecuritySchemes(tenantSchemeName,
                                new SecurityScheme()
                                        .name("X-Tenant-Subdomain")
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .description("Target tenant subdomain header (e.g., awais, ep-systems, default)")));
    }
}
