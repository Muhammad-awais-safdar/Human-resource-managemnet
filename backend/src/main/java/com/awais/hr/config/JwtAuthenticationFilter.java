 package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.sql.DataSource;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtils jwtUtils;
    private final DataSource dataSource;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, DataSource dataSource) {
        this.jwtUtils = jwtUtils;
        this.dataSource = dataSource;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.contains("/auth/") 
            || path.contains("/tenants/register") 
            || path.contains("/recruitment/jobs") 
            || path.contains("/recruitment/apply") 
            || path.equals("/error") 
            || path.endsWith("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            
            if (jwtUtils.validateToken(token)) {
                String email = jwtUtils.getEmailFromToken(token);
                String tenantId = jwtUtils.getTenantIdFromToken(token);
                String roles = jwtUtils.getRolesFromToken(token);
                
                // Override the thread context with the verified token tenant ID and user MDC
                if (tenantId != null) {
                    TenantContextHolder.setCurrentTenant(tenantId);
                    MDC.put("tenantId", tenantId);
                }
                if (email != null) {
                    MDC.put("userId", email);
                }

                List<SimpleGrantedAuthority> authorities = Arrays.stream(roles.split(","))
                        .map(String::trim)
                        .filter(r -> !r.isEmpty())
                        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, authorities
                );
                
                SecurityContextHolder.getContext().setAuthentication(auth);

                // Verify Session IP & User-Agent Device Binding signatures if active_session table exists
                try {
                    org.springframework.jdbc.core.JdbcTemplate jdbcTemplate = new org.springframework.jdbc.core.JdbcTemplate(dataSource);
                    String clientIp = request.getRemoteAddr();
                    String userAgent = request.getHeader("User-Agent");

                    List<Map<String, Object>> sessions = jdbcTemplate.queryForList(
                            "SELECT ip_address, user_agent FROM active_session WHERE token = ?",
                            token
                    );

                    if (!sessions.isEmpty()) {
                        Map<String, Object> session = sessions.get(0);
                        String savedIp = (String) session.get("ip_address");
                        String savedUserAgent = (String) session.get("user_agent");

                        if (savedIp != null && savedUserAgent != null && (!Objects.equals(savedIp, clientIp) || !Objects.equals(savedUserAgent, userAgent))) {
                            log.warn("[SECURITY ALERT] Session hijack attempt detected for user: {}. Client IP: {}, expected: {}", email, clientIp, savedIp);
                            jdbcTemplate.update("DELETE FROM active_session WHERE token = ?", token);
                            SecurityContextHolder.clearContext();
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Security alert: Device signature mismatch. Session revoked.");
                            return;
                        }
                    }
                } catch (Exception e) {
                    log.debug("Session verification note: {}", e.getMessage());
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
}

