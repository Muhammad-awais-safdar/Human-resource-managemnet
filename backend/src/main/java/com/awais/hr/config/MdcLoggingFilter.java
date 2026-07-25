package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MdcLoggingFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_HEADER = "X-Trace-ID";
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = "tr-" + UUID.randomUUID().toString().substring(0, 8);
        }

        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = "corr-" + UUID.randomUUID().toString().substring(0, 8);
        }

        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = request.getHeader("X-Tenant");
        }
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = "awais";
        }

        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr();
        }

        try {
            MDC.put("tenantId", tenantId);
            MDC.put("traceId", traceId);
            MDC.put("correlationId", correlationId);
            MDC.put("clientIp", clientIp);
            MDC.put("requestUri", request.getRequestURI());
            MDC.put("method", request.getMethod());

            response.setHeader(TRACE_ID_HEADER, traceId);
            response.setHeader(CORRELATION_ID_HEADER, correlationId);

            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
