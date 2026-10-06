package com.awais.hr.exception;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.observability.service.ObservabilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final ObjectProvider<ObservabilityService> observabilityServiceProvider;

    public GlobalExceptionHandler(ObjectProvider<ObservabilityService> observabilityServiceProvider) {
        this.observabilityServiceProvider = observabilityServiceProvider;
    }

    private void logExceptionToDb(Exception ex, String category) {
        try {
            ObservabilityService obsService = observabilityServiceProvider.getIfAvailable();
            if (obsService != null) {
                String traceId = MDC.get("traceId");
                String tenantId = TenantContextHolder.getCurrentTenant();
                StringWriter sw = new StringWriter();
                ex.printStackTrace(new PrintWriter(sw));
                
                obsService.recordExceptionLog(
                        tenantId != null ? tenantId : "awais",
                        MDC.get("requestId"),
                        traceId,
                        ex.getClass().getName(),
                        ex.getMessage(),
                        sw.toString(),
                        category,
                        "GlobalExceptionHandler",
                        MDC.get("requestUri"),
                        MDC.get("method"),
                        MDC.get("userId")
                );
            }
        } catch (Exception ignored) {}
    }

    private Map<String, Object> buildErrorResponse(HttpStatus status, String errorCode, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("statusCode", status.value());
        body.put("errorCode", errorCode);
        body.put("message", message);
        body.put("timestamp", Instant.now().toEpochMilli());
        body.put("path", MDC.get("requestUri"));
        body.put("traceId", MDC.get("traceId"));
        return body;
    }

    @ExceptionHandler(TenantAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleTenantAlreadyExists(TenantAlreadyExistsException ex) {
        log.warn("[TENANT CONFLICT] {}", ex.getMessage());
        logExceptionToDb(ex, "TenantManagement");
        Map<String, Object> body = buildErrorResponse(HttpStatus.CONFLICT, "TENANT_ALREADY_EXISTS", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(InvalidTenantException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTenant(InvalidTenantException ex) {
        log.warn("[INVALID TENANT] {}", ex.getMessage());
        logExceptionToDb(ex, "TenantManagement");
        Map<String, Object> body = buildErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_TENANT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.warn("[VALIDATION FAILURE] Payload validation failed for incoming request");
        logExceptionToDb(ex, "ValidationService");
        
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        Map<String, Object> body = buildErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Validation failed for incoming payload");
        body.put("errors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("[INVALID ARGUMENT] {}", ex.getMessage());
        logExceptionToDb(ex, "ValidationService");
        Map<String, Object> body = buildErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        log.warn("[STATE CONFLICT] {}", ex.getMessage());
        logExceptionToDb(ex, "WorkflowState");
        Map<String, Object> body = buildErrorResponse(HttpStatus.CONFLICT, "STATE_CONFLICT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(SecurityException ex) {
        log.warn("[SECURITY VIOLATION] {}", ex.getMessage());
        logExceptionToDb(ex, "SecurityService");
        Map<String, Object> body = buildErrorResponse(HttpStatus.FORBIDDEN, "ACCESS_DENIED", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralExceptions(Exception ex) {
        String traceId = MDC.get("traceId");
        log.error("[UNCAUGHT EXCEPTION] [TraceID: {}] Root Cause: {} - {}", traceId, ex.getClass().getName(), ex.getMessage(), ex);
        logExceptionToDb(ex, "UncaughtService");

        Map<String, Object> body = buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", 
                "An unexpected server-side error occurred: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
