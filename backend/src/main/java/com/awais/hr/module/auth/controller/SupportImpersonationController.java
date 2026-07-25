package com.awais.hr.module.auth.controller;

import com.awais.hr.module.auth.service.SupportImpersonationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/platform/support")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SupportImpersonationController {

    private final SupportImpersonationService impersonationService;

    @PostMapping("/impersonate")
    public ResponseEntity<?> createSupportSession(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String impersonatorEmail = (String) body.get("impersonatorEmail");
        String targetSubdomain = (String) body.get("targetSubdomain");
        String reason = (String) body.get("reason");
        Integer durationMinutes = body.get("durationMinutes") != null ? (Integer) body.get("durationMinutes") : 30;
        String clientIp = request.getRemoteAddr();

        if (impersonatorEmail == null || targetSubdomain == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "impersonatorEmail and targetSubdomain are required."));
        }

        try {
            String impersonationToken = impersonationService.createImpersonationToken(
                    impersonatorEmail, targetSubdomain, reason, clientIp, durationMinutes
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Temporary Support Impersonation Session generated successfully.",
                    "token", impersonationToken,
                    "targetSubdomain", targetSubdomain,
                    "expiresInMinutes", durationMinutes
            ));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("[SUPPORT IMPERSONATION ERROR] {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to create support session: " + e.getMessage()));
        }
    }
}
