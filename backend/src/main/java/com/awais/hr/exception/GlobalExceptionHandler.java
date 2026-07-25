package com.awais.hr.exception;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.observability.service.LogStreamManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final LogStreamManager logStreamManager;

    public GlobalExceptionHandler(LogStreamManager logStreamManager) {
        this.logStreamManager = logStreamManager;
    }

    @ExceptionHandler(TenantAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleTenantAlreadyExists(TenantAlreadyExistsException ex) {
        logStreamManager.addLog("WARN", "tenant", TenantContextHolder.getCurrentTenant(), "tr-ex", "Tenant conflict: " + ex.getMessage(), "127.0.0.1");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(InvalidTenantException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTenant(InvalidTenantException ex) {
        logStreamManager.addLog("WARN", "tenant", TenantContextHolder.getCurrentTenant(), "tr-ex", "Invalid tenant: " + ex.getMessage(), "127.0.0.1");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        logStreamManager.addLog("WARN", "system", TenantContextHolder.getCurrentTenant(), "tr-val", "Validation failed: " + ex.getMessage(), "127.0.0.1");
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
        logStreamManager.addLog("WARN", "security", TenantContextHolder.getCurrentTenant(), "sec-" + UUID.randomUUID().toString().substring(0, 6), "Security violation: " + ex.getMessage(), "127.0.0.1");
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralExceptions(Exception ex) {
        logStreamManager.addLog("ERROR", "system", TenantContextHolder.getCurrentTenant(), "err-" + UUID.randomUUID().toString().substring(0, 6), "Unhandled Exception: " + ex.getClass().getSimpleName() + " - " + ex.getMessage(), "127.0.0.1");
        ex.printStackTrace();
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", "An unexpected server-side error occurred: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

