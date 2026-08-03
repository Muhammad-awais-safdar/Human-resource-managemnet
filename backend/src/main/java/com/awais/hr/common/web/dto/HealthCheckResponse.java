package com.awais.hr.common.web.dto;

import java.time.Instant;

public record HealthCheckResponse(
    String status,
    String service,
    String version,
    Instant timestamp
) {}
