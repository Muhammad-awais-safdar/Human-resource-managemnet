package com.awais.hr.module.marketplace.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.marketplace.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping("/plugins")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getPlugins() {
        return ResponseEntity.ok(marketplaceService.getPlugins());
    }

    @PostMapping("/plugins")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> installPlugin(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(marketplaceService.installPlugin(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/plugins/{id}/toggle")
    @HasPermission("corehr:settings:write")
    public ResponseEntity<?> togglePlugin(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        try {
            boolean enabled = body.getOrDefault("enabled", true);
            return ResponseEntity.ok(marketplaceService.togglePlugin(id, enabled));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/plugins/{id}")
    @HasPermission("corehr:settings:write")
    public ResponseEntity<?> uninstallPlugin(@PathVariable String id) {
        try {
            return ResponseEntity.ok(marketplaceService.uninstallPlugin(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping(value = "/plugins/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @HasPermission("corehr:settings:write")
    public ResponseEntity<?> uploadPluginBundle(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().endsWith(".zip")) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid file. Please upload a valid .zip plugin bundle."));
        }
        try {
            File tempFile = File.createTempFile("plugin_upload_", ".zip");
            file.transferTo(tempFile);

            Map<String, Object> result = marketplaceService.uploadAndInstallPluginBundle(tempFile, file.getOriginalFilename());
            tempFile.delete();
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(422).body(Map.of("success", false, "error", "SANDBOX_VALIDATION_FAILED", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Failed to process plugin bundle: " + e.getMessage()));
        }
    }
}
