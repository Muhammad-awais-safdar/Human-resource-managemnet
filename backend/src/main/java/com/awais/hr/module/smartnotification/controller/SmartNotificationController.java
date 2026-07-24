package com.awais.hr.module.smartnotification.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.smartnotification.service.SmartNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/smart-notifications")
public class SmartNotificationController {

    private final SmartNotificationService notificationService;

    public SmartNotificationController(SmartNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/mine")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getMyNotifications(@RequestParam(defaultValue = "user@workforceos.com") String email) {
        return ResponseEntity.ok(notificationService.getMyNotifications(email));
    }

    @PostMapping("/read-all")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> markAllRead(@RequestParam(defaultValue = "user@workforceos.com") String email) {
        return ResponseEntity.ok(notificationService.markAllRead(email));
    }

    @GetMapping("/preferences")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<Map<String, Object>> getPreferences(@RequestParam(defaultValue = "user@workforceos.com") String email) {
        return ResponseEntity.ok(notificationService.getPreferences(email));
    }

    @PostMapping("/preferences")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> updatePreferences(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(notificationService.updatePreferences(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
