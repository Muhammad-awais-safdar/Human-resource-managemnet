package com.awais.hr.module.marketplace.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.marketplace.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
