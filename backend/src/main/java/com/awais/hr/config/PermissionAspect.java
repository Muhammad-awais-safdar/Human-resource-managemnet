package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.observability.service.ObservabilityService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.lang.reflect.Method;

@Aspect
@Component
public class PermissionAspect {

    private static final Logger log = LoggerFactory.getLogger(PermissionAspect.class);
    private final DataSource dataSource;
    private final ObjectProvider<ObservabilityService> observabilityServiceProvider;

    public PermissionAspect(DataSource dataSource) {
        this(dataSource, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public PermissionAspect(DataSource dataSource, ObjectProvider<ObservabilityService> observabilityServiceProvider) {
        this.dataSource = dataSource;
        this.observabilityServiceProvider = observabilityServiceProvider;
    }

    @Before("@annotation(com.awais.hr.config.HasPermission)")
    public void checkPermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        HasPermission hasPermission = method.getAnnotation(HasPermission.class);
        String requiredPermission = hasPermission.value();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            log.warn("[SECURITY REJECTION] Anonymous request denied access to protected method: {}", method.getName());
            throw new SecurityException("Unauthorized: User not authenticated.");
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String str && !"anonymousUser".equals(str)) {
            email = str;
        } else {
            log.warn("[SECURITY REJECTION] Invalid principal type for method: {}", method.getName());
            throw new SecurityException("Unauthorized: User not authenticated.");
        }

        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) {
            log.warn("[SECURITY REJECTION] Missing tenant context for user: {} on method: {}", email, method.getName());
            throw new SecurityException("Unauthorized: Tenant context not resolved.");
        }

        // Admin role bypass check
        if (authentication.getAuthorities() != null) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) ||
                                   "ROLE_SYSTEM_ADMIN".equals(a.getAuthority()) ||
                                   "ROLE_SUPER_ADMIN".equals(a.getAuthority()) ||
                                   "ADMIN".equals(a.getAuthority()) ||
                                   "SYSTEM_ADMIN".equals(a.getAuthority()) ||
                                   "SUPER_ADMIN".equals(a.getAuthority()));
            if (isAdmin) {
                return;
            }
        }

        // Query the database to check if the user has the required permission mapping and active role
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String sql = "SELECT COUNT(*) FROM employee e " +
                     "JOIN employee_role er ON e.id = er.employee_id " +
                     "JOIN role r ON er.role_id = r.id " +
                     "JOIN role_permission rp ON r.id = rp.role_id " +
                     "JOIN permission p ON rp.permission_id = p.id " +
                     "WHERE e.email = ? AND p.name = ? AND e.status = 'ACTIVE' AND COALESCE(r.status, 'ACTIVE') = 'ACTIVE'";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email, requiredPermission);

        if (count == null || count == 0) {
            String errorMsg = "Forbidden: User " + email + " missing required permission '" + requiredPermission + "'";
            log.warn("[SECURITY REJECTION] {}", errorMsg);
            if (observabilityServiceProvider != null) {
                ObservabilityService obsService = observabilityServiceProvider.getIfAvailable();
                if (obsService != null) {
                    obsService.recordSecurityEvent(tenantId, email, "ACCESS_DENIED", "WARN", "127.0.0.1", "Browser", method.getName(), "BEFORE", "{\"permission\":\"" + requiredPermission + "\"}");
                }
            }
            throw new SecurityException(errorMsg);
        }
    }
}

