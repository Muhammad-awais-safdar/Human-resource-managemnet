package com.awais.hr.common.web;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.common.web.dto.HealthCheckResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/health")
public class HealthCheckController {

    @GetMapping
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
