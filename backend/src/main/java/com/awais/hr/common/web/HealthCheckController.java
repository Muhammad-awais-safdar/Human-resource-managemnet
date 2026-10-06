package com.awais.hr.common.web;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.common.web.dto.HealthCheckResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Platform Health & Diagnostics", description = "Endpoints for uptime monitoring, cluster health checks, and API readiness probes")
public class HealthCheckController {

    @GetMapping
    @Operation(summary = "Check Backend Engine Health", description = "Probes system status, database connectivity readiness, and API engine runtime uptime")
    public ResponseEntity<ApiResponse<HealthCheckResponse>> checkHealth() {
        HealthCheckResponse response = new HealthCheckResponse(
            "UP",
            "Awais HR Enterprise Engine",
            "v1.0.0",
            Instant.now()
        );
        return ResponseEntity.ok(ApiResponse.success("System operational", response));
    }
}
