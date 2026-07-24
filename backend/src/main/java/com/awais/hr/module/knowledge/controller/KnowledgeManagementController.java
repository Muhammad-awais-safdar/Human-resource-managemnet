package com.awais.hr.module.knowledge.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.knowledge.service.KnowledgeManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/knowledge-management")
public class KnowledgeManagementController {

    private final KnowledgeManagementService knowledgeService;

    public KnowledgeManagementController(KnowledgeManagementService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @GetMapping("/articles")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getArticles() {
        return ResponseEntity.ok(knowledgeService.getArticles());
    }

    @PostMapping("/articles")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createArticle(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(knowledgeService.createArticle(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/sops")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getSops() {
        return ResponseEntity.ok(knowledgeService.getSops());
    }

    @PostMapping("/sops")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createSop(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(knowledgeService.createSop(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
