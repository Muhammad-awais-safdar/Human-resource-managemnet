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

    @ExceptionHandler(TenantAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleTenantAlreadyExists(TenantAlreadyExistsException ex) {
        log.warn("[TENANT CONFLICT] {}", ex.getMessage());
        logExceptionToDb(ex, "TenantManagement");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(InvalidTenantException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTenant(InvalidTenantException ex) {
        log.warn("[INVALID TENANT] {}", ex.getMessage());
        logExceptionToDb(ex, "TenantManagement");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.warn("[VALIDATION FAILURE] Payload validation failed for incoming request");
        logExceptionToDb(ex, "ValidationService");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        body.put("message", "Validation failed for incoming payload");
        body.put("errors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(SecurityException ex) {
        log.warn("[SECURITY VIOLATION] {}", ex.getMessage());
        logExceptionToDb(ex, "SecurityService");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(ModuleDisabledException.class)
    public ResponseEntity<Map<String, Object>> handleModuleDisabledException(ModuleDisabledException ex) {
        log.warn("[MODULE DISABLED] Access attempt to disabled module: {}", ex.getMessage());
        logExceptionToDb(ex, "ModuleControl");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("moduleDisabled", true);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralExceptions(Exception ex) {
        String traceId = MDC.get("traceId");
        log.error("[UNCAUGHT EXCEPTION] [TraceID: {}] Root Cause: {} - {}", traceId, ex.getClass().getName(), ex.getMessage(), ex);
        logExceptionToDb(ex, "UncaughtService");

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", "An unexpected server-side error occurred: " + ex.getMessage());
        body.put("traceId", traceId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}


