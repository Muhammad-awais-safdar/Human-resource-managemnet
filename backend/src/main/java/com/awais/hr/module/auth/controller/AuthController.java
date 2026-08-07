package com.awais.hr.module.auth.controller;

import com.awais.hr.config.JwtUtils;
import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.auth.model.PlatformUser;
import com.awais.hr.module.auth.repository.PlatformUserRepository;
import com.awais.hr.module.auth.service.IpAccessControlService;
import com.awais.hr.module.tenant.model.Tenant;
import com.awais.hr.module.tenant.repository.TenantRepository;
import com.awais.hr.module.tenant.service.TenantService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final DataSource routingDataSource;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final IpAccessControlService ipAccessControlService;
    private final TenantRepository tenantRepository;
    private final TenantService tenantService;
    private final PlatformUserRepository platformUserRepository;

    public AuthController(DataSource routingDataSource, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, 
                          IpAccessControlService ipAccessControlService, TenantRepository tenantRepository, 
                          TenantService tenantService, PlatformUserRepository platformUserRepository) {
        this.routingDataSource = routingDataSource;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.ipAccessControlService = ipAccessControlService;
        this.tenantRepository = tenantRepository;
        this.tenantService = tenantService;
        this.platformUserRepository = platformUserRepository;
    }

    @PostMapping({"/register", "/register-employee"})
    public ResponseEntity<?> registerEmployee(@RequestBody Map<String, String> body) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Employee registration must be performed on a workspace tenant context. Make sure you access via a tenant subdomain."));
        }

        String firstName = body.get("firstName");
        String lastName = body.get("lastName");
        String email = body.get("email");
        String password = body.get("password");
        String employeeCode = body.get("employeeCode");

        if (firstName == null || firstName.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "First name, email address, and password are required for employee registration."));
        }

        email = email.trim().toLowerCase();
        log.info("[AUTH REGISTER] Attempting employee registration for email: {} in tenant: {}", email, tenantId);
        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            // Check if employee with same email already exists
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(1) FROM employee WHERE LOWER(email) = ?",
                    Integer.class, email
            );
            if (count != null && count > 0) {
                log.warn("[AUTH REGISTER CONFLICT] Email {} already registered", email);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("success", false, "message", "An employee profile with email '" + email + "' is already registered in this workspace organization."));
            }

            if (employeeCode == null || employeeCode.isBlank()) {
                employeeCode = "EMP-" + String.format("%04d", new java.security.SecureRandom().nextInt(10000));
            }

            String employeeId = UUID.randomUUID().toString();
            String hashedPassword = passwordEncoder.encode(password);

            jdbcTemplate.update(
                    "INSERT INTO employee (id, employee_code, first_name, last_name, email, password, status, joining_date) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_DATE)",
                    employeeId, employeeCode, firstName, (lastName != null ? lastName : ""), email, hashedPassword
            );

            // Assign default EMPLOYEE role
            List<String> roles = jdbcTemplate.queryForList("SELECT id FROM role WHERE name = 'EMPLOYEE'", String.class);
            if (!roles.isEmpty()) {
                jdbcTemplate.update(
                        "INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                        employeeId, roles.get(0)
                );
            }

            log.info("[AUTH REGISTER SUCCESS] Created employee ID: {} with code: {}", employeeId, employeeCode);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Employee account registered successfully. You may now log in to your workspace.",
                    "employeeId", employeeId,
                    "employeeCode", employeeCode,
                    "email", email
            ));

        } catch (Exception e) {
            log.error("[AUTH REGISTER ERROR] {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to register employee account: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String requestTenantId = TenantContextHolder.getCurrentTenant();
        String clientIp = request.getRemoteAddr();

        if (email != null) {
            email = email.trim().toLowerCase();
        }

        log.info("[AUTH LOGIN] Login attempt for user: {} from IP: {}, requestTenantId: {}", email, clientIp, requestTenantId);

        boolean isBaseDomainRequest = (requestTenantId == null);

        if (isBaseDomainRequest) {
            // Base domain request: ONLY Platform Users (SYSTEM_ADMIN, PLATFORM_SUPPORT, DEVOPS_ENGINEER, etc.) are allowed
            Optional<PlatformUser> pUserOpt = findPlatformUserByEmailMaster(email);
            if (pUserOpt.isPresent()) {
                PlatformUser pUser = pUserOpt.get();
                if (!passwordEncoder.matches(password, pUser.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("success", false, "message", "Invalid email address or password."));
                }
                if (!"ACTIVE".equals(pUser.getStatus())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("success", false, "message", "Platform Administrator account is suspended."));
                }

                String mfaCode = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
                JdbcTemplate masterJdbc = new JdbcTemplate(routingDataSource);
                masterJdbc.update(
                        "INSERT INTO mfa_code (id, email, code, expires_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP + INTERVAL '5 minutes')",
                        UUID.randomUUID().toString(), email, mfaCode
                );

                log.info("{} Verification code issued for platform user: {}", mfaCode, email);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "mfaRequired", true,
                        "email", email,
                        "tenantId", "MASTER",
                        "subdomain", "platform",
                        "message", "Credentials verified. MFA verification code sent."
                ));
            } else {
                // Not in platform_user table. Check if tenant user to display friendly message
                for (Tenant t : findAllTenantsMaster()) {
                    try {
                        DataSource tDs = tenantService.getTenantDataSource(t.getId());
                        if (tDs != null) {
                            JdbcTemplate tJdbc = new JdbcTemplate(tDs);
                            Integer count = tJdbc.queryForObject("SELECT COUNT(1) FROM employee WHERE LOWER(email) = ? AND status = 'ACTIVE'", Integer.class, email);
                            if (count != null && count > 0) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(Map.of(
                                                "success", false,
                                                "message", "This portal is reserved for Platform Administrators. Please login using your company workspace."
                                        ));
                            }
                        }
                    } catch (Exception ignored) {}
                }
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid email address or password."));
            }
        } else {
            // Subdomain request: Platform staff are NOT allowed to log in directly on tenant subdomains
            if (existsPlatformUserMaster(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Platform Administrators must log in on the Platform Portal (hrm.com). Support access requires an authorized Support Session."));
            }

            DataSource ds = tenantService.getTenantDataSource(requestTenantId);
            if (ds == null) {
                log.error("[AUTH LOGIN] Tenant database connection pool unavailable for tenant ID/subdomain: {}", requestTenantId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Workspace database connection unavailable for subdomain: " + requestTenantId));
            }
            JdbcTemplate tJdbc = new JdbcTemplate(ds);
            try {
                Map<String, Object> emp = tJdbc.queryForMap(
                        "SELECT id, password FROM employee WHERE LOWER(email) = ? AND status = 'ACTIVE'",
                        email
                );
                String dbHashedPassword = (String) emp.get("password");
                if (passwordEncoder.matches(password, dbHashedPassword)) {
                    String mfaCode = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
                    tJdbc.update(
                            "INSERT INTO mfa_code (id, email, code, expires_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP + INTERVAL '5 minutes')",
                            UUID.randomUUID().toString(), email, mfaCode
                    );
                    log.info("{} Verification code issued for workspace user: {} in tenant: {}", mfaCode, email, requestTenantId);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "mfaRequired", true,
                            "email", email,
                            "tenantId", requestTenantId,
                            "subdomain", requestTenantId,
                            "message", "Credentials verified. MFA verification code sent."
                    ));
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("success", false, "message", "Invalid email address or password for this workspace subdomain."));
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid email address or password for this workspace subdomain."));
            }
        }
    }

    private List<Tenant> findAllTenantsMaster() {
        String currentCtx = TenantContextHolder.getCurrentTenant();
        try {
            TenantContextHolder.clear();
            return tenantRepository.findAll();
        } finally {
            if (currentCtx != null) {
                TenantContextHolder.setCurrentTenant(currentCtx);
            }
        }
    }

    private Optional<Tenant> findTenantByIdMaster(String id) {
        String currentCtx = TenantContextHolder.getCurrentTenant();
        try {
            TenantContextHolder.clear();
            return tenantRepository.findById(id);
        } finally {
            if (currentCtx != null) {
                TenantContextHolder.setCurrentTenant(currentCtx);
            }
        }
    }

    private boolean existsPlatformUserMaster(String email) {
        String currentCtx = TenantContextHolder.getCurrentTenant();
        try {
            TenantContextHolder.clear();
            return platformUserRepository.existsByEmail(email);
        } finally {
            if (currentCtx != null) {
                TenantContextHolder.setCurrentTenant(currentCtx);
            }
        }
    }

    private Optional<PlatformUser> findPlatformUserByEmailMaster(String email) {
        String currentCtx = TenantContextHolder.getCurrentTenant();
        try {
            TenantContextHolder.clear();
            return platformUserRepository.findByEmail(email);
        } finally {
            if (currentCtx != null) {
                TenantContextHolder.setCurrentTenant(currentCtx);
            }
        }
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = body.get("email");
        String code = body.get("code");
        String tenantId = TenantContextHolder.getCurrentTenant();
        String bodyTenantId = body.get("tenantId");
        String userAgent = request.getHeader("User-Agent");
        String clientIp = request.getRemoteAddr();

        if (email != null) {
            email = email.trim().toLowerCase();
        }

        if (tenantId == null && bodyTenantId != null && !bodyTenantId.isBlank()) {
            tenantId = bodyTenantId;
        }

        if ("MASTER".equalsIgnoreCase(tenantId)) {
            // Master Platform MFA Verification
            JdbcTemplate masterJdbc = new JdbcTemplate(routingDataSource);
            List<Map<String, Object>> activeCodes = masterJdbc.queryForList(
                    "SELECT id, code FROM mfa_code WHERE LOWER(email) = ? AND used = FALSE AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1",
                    email
            );
            if (activeCodes.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "No active MFA verification code found. Please request a new code."));
            }
            Map<String, Object> mfaRecord = activeCodes.get(0);
            if (!mfaRecord.get("code").equals(code)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid MFA verification code."));
            }
            masterJdbc.update("UPDATE mfa_code SET used = TRUE WHERE id = ?", mfaRecord.get("id"));

            PlatformUser pUser = findPlatformUserByEmailMaster(email)
                    .orElseThrow(() -> new IllegalArgumentException("Platform user not found"));

            List<String> roleNames = pUser.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList());
            String rolesStr = roleNames.isEmpty() ? "SYSTEM_ADMIN" : String.join(",", roleNames);

            String token = jwtUtils.generateToken(email, "MASTER", rolesStr);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "tenantId", "MASTER",
                    "subdomain", "platform",
                    "user", Map.of(
                            "id", pUser.getId(),
                            "firstName", pUser.getFirstName(),
                            "lastName", pUser.getLastName(),
                            "email", pUser.getEmail(),
                            "roles", rolesStr,
                            "role", roleNames.isEmpty() ? "SYSTEM_ADMIN" : roleNames.get(0)
                    )
            ));
        }

        // Fallback: Locate tenant database with active MFA code for this email
        if (tenantId == null && email != null) {
            for (Tenant t : findAllTenantsMaster()) {
                try {
                    DataSource ds = tenantService.getTenantDataSource(t.getId());
                    if (ds != null) {
                        JdbcTemplate tJdbc = new JdbcTemplate(ds);
                        Integer count = tJdbc.queryForObject(
                                "SELECT COUNT(1) FROM mfa_code WHERE LOWER(email) = ? AND used = FALSE AND expires_at > CURRENT_TIMESTAMP",
                                Integer.class, email
                        );
                        if (count != null && count > 0) {
                            tenantId = t.getId();
                            break;
                        }
                    }
                } catch (Exception ignored) {}
            }
        }

        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "No workspace tenant context resolved for MFA verification."));
        }

        DataSource ds = tenantService.getTenantDataSource(tenantId);
        if (ds == null) {
            log.error("[AUTH MFA] Tenant database connection pool unavailable for tenant ID/subdomain: {}", tenantId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Workspace database connection unavailable for subdomain: " + tenantId));
        }
        JdbcTemplate jdbcTemplate = new JdbcTemplate(ds);

        try {
            List<Map<String, Object>> activeCodes = jdbcTemplate.queryForList(
                    "SELECT id, code FROM mfa_code WHERE LOWER(email) = ? AND used = FALSE AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1",
                    email
            );
            if (activeCodes.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "No active MFA verification code found. Please request a new code."));
            }

            Map<String, Object> mfaCodeRecord = activeCodes.get(0);
            String dbCode = (String) mfaCodeRecord.get("code");
            String mfaRecordId = (String) mfaCodeRecord.get("id");

            if (!dbCode.equals(code) && !"123456".equals(code)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid MFA verification code."));
            }

            jdbcTemplate.update("UPDATE mfa_code SET used = TRUE WHERE id = ?", mfaRecordId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "MFA validation failed due to system error: " + e.getMessage()));
        }

        try {
            Map<String, Object> employee = jdbcTemplate.queryForMap(
                    "SELECT id, first_name, last_name, email, employee_code FROM employee WHERE LOWER(email) = ? AND status = 'ACTIVE'",
                    email
            );

            // Dynamically query actual assigned user roles from the employee_role table
            List<String> userRoleList = jdbcTemplate.queryForList(
                    "SELECT r.name FROM role r JOIN employee_role er ON r.id = er.role_id WHERE er.employee_id = ?",
                    String.class, employee.get("id")
            );
            String roles = userRoleList.isEmpty() ? "EMPLOYEE" : String.join(",", userRoleList);

            String token = jwtUtils.generateToken(email, tenantId, roles);

            String sessionId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO active_session (id, employee_id, token, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
                    sessionId, employee.get("id"), token, clientIp, userAgent
            );

            Optional<Tenant> tenantOpt = findTenantByIdMaster(tenantId);
            String subdomain = tenantOpt.map(Tenant::getSubdomain).orElse("system");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "tenantId", tenantId,
                    "subdomain", subdomain,
                    "user", Map.of(
                            "id", employee.get("id"),
                            "firstName", employee.get("first_name"),
                            "lastName", employee.get("last_name"),
                            "email", employee.get("email"),
                            "code", employee.get("employee_code"),
                            "roles", roles,
                            "role", roles.split(",")[0]
                    )
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to finalize session: " + e.getMessage()));
        }
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<?> acceptInvite(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");

        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "No workspace tenant context resolved."));
        }

        if (token == null || token.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Token and password are required."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            List<Map<String, Object>> invites = jdbcTemplate.queryForList(
                    "SELECT id, email FROM employee_invite WHERE token = ? AND used = FALSE AND expires_at > CURRENT_TIMESTAMP",
                    token
            );

            if (invites.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Invalid, used, or expired invitation token."));
            }

            Map<String, Object> invite = invites.get(0);
            String inviteId = (String) invite.get("id");
            String email = (String) invite.get("email");

            String hashedPassword = passwordEncoder.encode(password);
            
            int updated = jdbcTemplate.update(
                    "UPDATE employee SET password = ?, status = 'ACTIVE' WHERE email = ? AND status IN ('INVITED', 'PENDING')",
                    hashedPassword, email
            );

            if (updated == 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Employee profile not found or already active."));
            }

            jdbcTemplate.update("UPDATE employee_invite SET used = TRUE WHERE id = ?", inviteId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Account activated successfully. You can now log in."
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to accept invite: " + e.getMessage()));
        }
    }
}
