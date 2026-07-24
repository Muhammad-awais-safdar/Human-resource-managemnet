package com.awais.hr.module.visitor.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.visitor.service.VisitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/visitors")
public class VisitorController {

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getVisitors() {
        return ResponseEntity.ok(visitorService.getVisitors());
    }

    @PostMapping
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> registerVisitor(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(visitorService.registerVisitor(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/check-in")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<Map<String, Object>> checkInVisitor(@PathVariable String id) {
        return ResponseEntity.ok(visitorService.checkInVisitor(id));
    }

    @PostMapping("/{id}/check-out")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<Map<String, Object>> checkOutVisitor(@PathVariable String id) {
        return ResponseEntity.ok(visitorService.checkOutVisitor(id));
    }

    @PostMapping("/{id}/status")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<Map<String, Object>> updateVisitorStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(visitorService.updateVisitorStatus(id, body.get("status")));
    }
}
