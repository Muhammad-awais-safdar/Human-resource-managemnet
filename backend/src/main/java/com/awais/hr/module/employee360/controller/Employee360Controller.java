package com.awais.hr.module.employee360.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.employee360.service.Employee360Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/suite/employee-360")
public class Employee360Controller {

    private final Employee360Service emp360Service;

    public Employee360Controller(Employee360Service emp360Service) {
        this.emp360Service = emp360Service;
    }

    @GetMapping("/{employeeId}")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> get360Profile(@PathVariable String employeeId) {
        return ResponseEntity.ok(emp360Service.get360Profile(employeeId));
    }

    @PostMapping("/manager-notes")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> addManagerNote(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(emp360Service.addManagerNote(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
