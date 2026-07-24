package com.awais.hr.module.career.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.career.service.CareerDevelopmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/career-development")
public class CareerDevelopmentController {

    private final CareerDevelopmentService careerService;

    public CareerDevelopmentController(CareerDevelopmentService careerService) {
        this.careerService = careerService;
    }

    @GetMapping("/paths")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getCareerPaths() {
        return ResponseEntity.ok(careerService.getCareerPaths());
    }

    @PostMapping("/paths")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createCareerPath(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(careerService.createCareerPath(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/mentorship")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getMentorshipPairs() {
        return ResponseEntity.ok(careerService.getMentorshipPairs());
    }

    @PostMapping("/mentorship")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createMentorshipPair(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(careerService.createMentorshipPair(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/plans")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getDevelopmentPlans() {
        return ResponseEntity.ok(careerService.getDevelopmentPlans());
    }

    @PostMapping("/plans")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createDevelopmentPlan(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(careerService.createDevelopmentPlan(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
