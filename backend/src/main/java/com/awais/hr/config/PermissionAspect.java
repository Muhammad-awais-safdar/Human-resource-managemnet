package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.lang.reflect.Method;

@Aspect
@Component
public class PermissionAspect {

    private final DataSource dataSource;

    public PermissionAspect(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Before("@annotation(com.awais.hr.config.HasPermission)")
    public void checkPermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        HasPermission hasPermission = method.getAnnotation(HasPermission.class);
        String requiredPermission = hasPermission.value();

        // Retrieve current authenticated user email principal
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized: User not authenticated.");
        }
        String email = (String) principal;

        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) {
            throw new SecurityException("Unauthorized: Tenant context not resolved.");
        }

        // Query the database to check if the user has the required permission mapping
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String sql = "SELECT COUNT(*) FROM employee e " +
                     "JOIN employee_role er ON e.id = er.employee_id " +
                     "JOIN role_permission rp ON er.role_id = rp.role_id " +
                     "JOIN permission p ON rp.permission_id = p.id " +
                     "WHERE e.email = ? AND p.name = ? AND e.status = 'ACTIVE'";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email, requiredPermission);

        if (count == null || count == 0) {
            throw new SecurityException("Forbidden: Missing required permission '" + requiredPermission + "'");
        }
    }
}
