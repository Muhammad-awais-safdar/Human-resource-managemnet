package com.awais.hr.module.communication.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.communication.service.InternalCommunicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/internal-communication")
public class InternalCommunicationController {

    private final InternalCommunicationService communicationService;

    public InternalCommunicationController(InternalCommunicationService communicationService) {
        this.communicationService = communicationService;
    }

    @GetMapping("/posts")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getFeedPosts() {
        return ResponseEntity.ok(communicationService.getFeedPosts());
    }

    @PostMapping("/posts")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createFeedPost(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(communicationService.createFeedPost(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/polls")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getPolls() {
        return ResponseEntity.ok(communicationService.getPolls());
    }

    @PostMapping("/polls")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createPoll(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(communicationService.createPoll(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
