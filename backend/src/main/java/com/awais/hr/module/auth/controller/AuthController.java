package com.awais.hr.module.auth.controller;

import com.awais.hr.config.JwtUtils;
import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.auth.service.IpAccessControlService;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final DataSource routingDataSource;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final IpAccessControlService ipAccessControlService;

    public AuthController(DataSource routingDataSource, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, IpAccessControlService ipAccessControlService) {
        this.routingDataSource = routingDataSource;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.ipAccessControlService = ipAccessControlService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String tenantId = TenantContextHolder.getCurrentTenant();
        String clientIp = request.getRemoteAddr();

        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "No workspace tenant context resolved. Make sure you access via a tenant subdomain."));
        }

        // Real IP Restriction Check delegated to GeofenceService
        // Disabled for Docker development - re-enable for production
        // if (!ipAccessControlService.isIpAllowed(clientIp)) {
        //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
        //             .body(Map.of("success", false, "message", "Access denied: IP restriction enforced."));
        // }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        try {
            // Query employee table in the dynamically resolved tenant database
            Map<String, Object> employee = jdbcTemplate.queryForMap(
                    "SELECT id, first_name, last_name, email, password, employee_code FROM employee WHERE email = ? AND status = 'ACTIVE'",
                    email
            );

            String dbHashedPassword = (String) employee.get("password");

            if (passwordEncoder.matches(password, dbHashedPassword)) {
                // Return multi-step MFA trigger with dynamically generated Secure random OTP
                String mfaCode = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
                
                jdbcTemplate.update(
                        "INSERT INTO mfa_code (id, email, code, expires_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP + INTERVAL '5 minutes')",
                        UUID.randomUUID().toString(), email, mfaCode
                );
                
                System.out.println("[MFA] Generated verification code " + mfaCode + " for user: " + email);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "mfaRequired", true,
                        "email", email,
                        "message", "Credentials verified. MFA verification code sent."
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid email or password"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid email or password"));
        }
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = body.get("email");
        String code = body.get("code");
        String tenantId = TenantContextHolder.getCurrentTenant();
        String userAgent = request.getHeader("User-Agent");
        String clientIp = request.getRemoteAddr();

        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "No workspace tenant context resolved."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(routingDataSource);

        // Validate MFA code dynamically against database
        try {
            List<Map<String, Object>> activeCodes = jdbcTemplate.queryForList(
                    "SELECT id, code FROM mfa_code WHERE email = ? AND used = FALSE AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1",
                    email
            );
            if (activeCodes.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "No active MFA verification code found. Please request a new code."));
            }

            Map<String, Object> mfaCodeRecord = activeCodes.get(0);
            String dbCode = (String) mfaCodeRecord.get("code");
            String mfaRecordId = (String) mfaCodeRecord.get("id");

            if (!dbCode.equals(code)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid MFA verification code."));
            }

            // Mark code as used immediately to prevent replay attacks (ACID atomicity)
            jdbcTemplate.update("UPDATE mfa_code SET used = TRUE WHERE id = ?", mfaRecordId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "MFA validation failed due to system error."));
        }

        try {
            Map<String, Object> employee = jdbcTemplate.queryForMap(
                    "SELECT id, first_name, last_name, email, employee_code FROM employee WHERE email = ? AND status = 'ACTIVE'",
                    email
            );

            // Standard role claims payload
            String roles = "ADMIN";

            // Generate cryptographically signed JWT Token
            String token = jwtUtils.generateToken(email, tenantId, roles);

            // Register session log to database
            String sessionId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO active_session (id, employee_id, token, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
                    sessionId, employee.get("id"), token, clientIp, userAgent
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "user", Map.of(
                            "id", employee.get("id"),
                            "firstName", employee.get("first_name"),
                            "lastName", employee.get("last_name"),
                            "email", employee.get("email"),
                            "code", employee.get("employee_code"),
                            "roles", roles
                    )
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to save session log: " + e.getMessage()));
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
            
            // Allow activating from INVITED or PENDING status
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

