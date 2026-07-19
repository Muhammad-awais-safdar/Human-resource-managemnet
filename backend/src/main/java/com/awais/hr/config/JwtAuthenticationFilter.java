package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    private final JwtUtils jwtUtils;
    private final DataSource dataSource;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, DataSource dataSource) {
        this.jwtUtils = jwtUtils;
        this.dataSource = dataSource;
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
                
                // Override the thread context with the verified token tenant ID
                if (tenantId != null) {
                    TenantContextHolder.setCurrentTenant(tenantId);
                }

                // Verify Session IP & User-Agent Device Binding signatures
                org.springframework.jdbc.core.JdbcTemplate jdbcTemplate = new org.springframework.jdbc.core.JdbcTemplate(dataSource);
                String clientIp = request.getRemoteAddr();
                String userAgent = request.getHeader("User-Agent");

                try {
                    List<Map<String, Object>> sessions = jdbcTemplate.queryForList(
                            "SELECT ip_address, user_agent FROM active_session WHERE token = ?",
                            token
                    );

                    if (sessions.isEmpty()) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired or revoked.");
                        return;
                    }

                    Map<String, Object> session = sessions.get(0);
                    String savedIp = (String) session.get("ip_address");
                    String savedUserAgent = (String) session.get("user_agent");

                    // Block access and revoke session if token is hijacked
                    if (!Objects.equals(savedIp, clientIp) || !Objects.equals(savedUserAgent, userAgent)) {
                        System.err.println("[SECURITY ALERT] Hijack attempt detected. Client IP: " + clientIp + ", expected: " + savedIp);
                        jdbcTemplate.update("DELETE FROM active_session WHERE token = ?", token);
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Security alert: Device signature mismatch. Session revoked.");
                        return;
                    }
                } catch (Exception e) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session verification failed.");
                    return;
                }
                
                List<SimpleGrantedAuthority> authorities = Arrays.stream(roles.split(","))
                        .map(String::trim)
                        .filter(r -> !r.isEmpty())
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                        .collect(Collectors.toList());
                
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, authorities
                );
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
