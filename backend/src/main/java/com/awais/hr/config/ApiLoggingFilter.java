package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class ApiLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = request.getRemoteAddr();
        String tenantId = TenantContextHolder.getCurrentTenant();

        String fullPath = uri + (queryString != null ? "?" + queryString : "");

        log.info("[API REQUEST] IP: {} | Tenant: {} | Method: {} | Path: {}",
                clientIp, tenantId != null ? tenantId : "NONE", method, fullPath);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            
            log.info("[API RESPONSE] IP: {} | Tenant: {} | Method: {} | Path: {} | Status: {} | Duration: {}ms",
                    clientIp, tenantId != null ? tenantId : "NONE", method, fullPath, status, duration);
        }
    }
}
