package com.awais.hr.module.aicopilot.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.aicopilot.service.AiCopilotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/ai-copilot")
public class AiCopilotController {

    private final AiCopilotService copilotService;

    public AiCopilotController(AiCopilotService copilotService) {
        this.copilotService = copilotService;
    }

    @GetMapping("/sessions")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getSessions() {
        return ResponseEntity.ok(copilotService.getSessions());
    }

    @PostMapping("/ask")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> askCopilot(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(copilotService.askCopilot(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
