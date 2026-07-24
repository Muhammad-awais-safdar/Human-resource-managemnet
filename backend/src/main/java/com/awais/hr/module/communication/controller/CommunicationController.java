package com.awais.hr.module.communication.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.communication.service.CommunicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/communication")
public class CommunicationController {

    private final CommunicationService communicationService;

    public CommunicationController(CommunicationService communicationService) {
        this.communicationService = communicationService;
    }

    // ── Announcements ───────────────────────────────────────────────────────────

    @GetMapping("/announcements")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getAnnouncements() {
        return ResponseEntity.ok(communicationService.getAnnouncements());
    }

    @PostMapping("/announcements")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> postAnnouncement(@AuthenticationPrincipal UserDetails user,
                                               @RequestBody Map<String, String> body) {
        try {
            communicationService.postAnnouncement(
                    getUsername(user),
                    body.get("title"),
                    body.get("content"),
                    body.get("targetAudience"),
                    body.get("expiresAt")
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Announcement posted."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/announcements/{id}")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable String id) {
        communicationService.deleteAnnouncement(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Announcement deleted."));
    }

    // ── Notifications ───────────────────────────────────────────────────────────

    @GetMapping("/notifications")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getNotifications(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(communicationService.getNotifications(getUsername(user)));
    }

    @GetMapping("/notifications/unread-count")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetails user) {
        long count = communicationService.getUnreadCount(getUsername(user));
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/notifications/{id}/read")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> markRead(@PathVariable String id) {
        communicationService.markNotificationRead(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private String getUsername(UserDetails user) {
        return user != null ? user.getUsername() : "system@company.com";
    }
}
