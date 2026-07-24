package com.awais.hr.module.salarystructure.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.salarystructure.service.SalaryStructureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/salary-structure")
public class SalaryStructureController {

    private final SalaryStructureService structureService;

    public SalaryStructureController(SalaryStructureService structureService) {
        this.structureService = structureService;
    }

    @GetMapping("/components")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getComponents() {
        return ResponseEntity.ok(structureService.getComponents());
    }

    @PostMapping("/components")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createComponent(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(structureService.createComponent(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/templates")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getTemplates() {
        return ResponseEntity.ok(structureService.getTemplates());
    }
}
