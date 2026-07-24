package com.awais.hr.module.engagement.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.engagement.service.EngagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/engagement")
public class EngagementController {

    private final EngagementService engagementService;

    public EngagementController(EngagementService engagementService) {
        this.engagementService = engagementService;
    }

    @GetMapping("/surveys")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getSurveys() {
        return ResponseEntity.ok(engagementService.getSurveys());
    }

    @PostMapping("/surveys")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createSurvey(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(engagementService.createSurvey(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/recognitions")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getRecognitions() {
        return ResponseEntity.ok(engagementService.getRecognitions());
    }

    @PostMapping("/recognitions")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> sendRecognition(@AuthenticationPrincipal UserDetails user, @RequestBody Map<String, Object> body) {
        try {
            String email = user != null ? user.getUsername() : "system@company.com";
            return ResponseEntity.ok(engagementService.sendRecognition(email, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/suggestions")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getSuggestions() {
        return ResponseEntity.ok(engagementService.getSuggestions());
    }

    @PostMapping("/suggestions")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> submitSuggestion(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(engagementService.submitSuggestion(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
