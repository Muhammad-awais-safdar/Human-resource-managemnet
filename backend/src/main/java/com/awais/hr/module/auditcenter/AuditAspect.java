package com.awais.hr.module.auditcenter;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);
    private final EnterpriseAuditService auditService;

    public AuditAspect(EnterpriseAuditService auditService) {
        this.auditService = auditService;
    }

    @Around("@annotation(auditable)")
    public Object auditMethodExecution(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String actorEmail = getAuthenticatedUserEmail();
        String correlationId = UUID.randomUUID().toString();
        String action = auditable.action();
        String entity = auditable.entity();

        log.info("[AUDIT ASPECT] Intercepting auditable action: {} on entity: {} by actor: {}", action, entity, actorEmail);

        Object result;
        try {
            result = joinPoint.proceed();
            auditService.logEvent(
                    "DEFAULT_TENANT",
                    actorEmail,
                    action,
                    entity,
                    "N/A",
                    null,
                    "SUCCESS",
                    "Method executed successfully: " + joinPoint.getSignature().getName(),
                    "127.0.0.1",
                    "SpringAOPAspect",
                    correlationId
            );
        } catch (Throwable t) {
            auditService.logEvent(
                    "DEFAULT_TENANT",
                    actorEmail,
                    action,
                    entity,
                    "N/A",
                    null,
                    "FAILED",
                    "Method execution failed: " + t.getMessage(),
                    "127.0.0.1",
                    "SpringAOPAspect",
                    correlationId
            );
            throw t;
        }

        return result;
    }

    private String getAuthenticatedUserEmail() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof String && !"anonymousUser".equals(principal)) {
                return (String) principal;
            }
        } catch (Exception ignored) {
        }
        return "system.user@workforceos.com";
    }
}
