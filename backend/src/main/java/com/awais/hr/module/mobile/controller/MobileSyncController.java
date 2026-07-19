package com.awais.hr.module.mobile.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.mobile.service.MobileSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/suite/mobile")
public class MobileSyncController {

    private final MobileSyncService mobileSyncService;

    public MobileSyncController(MobileSyncService mobileSyncService) {
        this.mobileSyncService = mobileSyncService;
    }

    @PostMapping("/register")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> registerDevice(@AuthenticationPrincipal UserDetails user,
                                             @RequestBody Map<String, String> body) {
        try {
            mobileSyncService.registerDevice(
                    user.getUsername(),
                    body.get("deviceToken"),
                    body.get("platform"),
                    body.get("clientVersion")
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Device registered."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/sync")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> syncDelta(@AuthenticationPrincipal UserDetails user,
                                        @RequestParam String deviceToken) {
        Map<String, Object> delta = mobileSyncService.syncDelta(deviceToken, user.getUsername());
        return ResponseEntity.ok(Map.of("success", true, "data", delta));
    }

    @PostMapping("/sync/push")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> pushDelta(@RequestBody Map<String, String> body) {
        try {
            mobileSyncService.pushDelta(body.get("deviceToken"), body.get("syncDeltaJson"));
            return ResponseEntity.ok(Map.of("success", true, "message", "Delta pushed."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/devices")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getDevices(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(mobileSyncService.getDevicesForEmployee(user.getUsername()));
    }

    @DeleteMapping("/deregister")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> deregister(@RequestParam String deviceToken) {
        mobileSyncService.deregisterDevice(deviceToken);
        return ResponseEntity.ok(Map.of("success", true, "message", "Device deregistered."));
    }
}
