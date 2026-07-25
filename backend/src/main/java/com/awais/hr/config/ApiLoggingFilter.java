package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.observability.service.LogStreamManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

@Component
public class ApiLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiLoggingFilter.class);
    private final LogStreamManager logStreamManager;

    public ApiLoggingFilter(LogStreamManager logStreamManager) {
        this.logStreamManager = logStreamManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = request.getRemoteAddr();
        String tenantId = TenantContextHolder.getCurrentTenant();
        String traceId = request.getHeader("X-Trace-ID");
        if (traceId == null || traceId.isBlank()) {
            traceId = "tr-" + UUID.randomUUID().toString().substring(0, 8);
        }

        String fullPath = uri + (queryString != null ? "?" + queryString : "");
        String moduleName = extractModuleName(uri);

        log.info("[API REQUEST] IP: {} | Tenant: {} | Method: {} | Path: {}",
                clientIp, tenantId != null ? tenantId : "NONE", method, fullPath);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            
            log.info("[API RESPONSE] IP: {} | Tenant: {} | Method: {} | Path: {} | Status: {} | Duration: {}ms",
                    clientIp, tenantId != null ? tenantId : "NONE", method, fullPath, status, duration);

            // Stream log entry to Observability Ring Buffer
            String logLevel = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
            String logMsg = String.format("%s %s -> HTTP %d (%d ms)", method, fullPath, status, duration);
            logStreamManager.addLog(logLevel, moduleName, tenantId, traceId, logMsg, clientIp);
        }
    }

    private String extractModuleName(String uri) {
        if (uri == null || !uri.contains("/suite/")) return "api";
        String path = uri.substring(uri.indexOf("/suite/") + 7);
        int nextSlash = path.indexOf('/');
        return nextSlash > 0 ? path.substring(0, nextSlash) : path;
    }
}

