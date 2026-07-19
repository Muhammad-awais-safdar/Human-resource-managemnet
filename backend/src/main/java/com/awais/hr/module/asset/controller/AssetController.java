package com.awais.hr.module.asset.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.asset.service.AssetService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/assets")
@CrossOrigin(origins = "*")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllAssets() {
        try {
            return ApiResponse.success(assetService.getAllAssets());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/my")
    public ApiResponse<List<Map<String, Object>>> getMyAssets() {
        try {
            return ApiResponse.success(assetService.getMyAssets(getAuthenticatedUserEmail()));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> addAsset(@RequestBody Map<String, String> body) {
        try {
            assetService.addAsset(
                    body.get("name"),
                    body.get("category"),
                    body.get("serialNumber"),
                    body.get("purchaseDate")
            );
            return ApiResponse.success(Map.of("success", true, "message", "Asset added successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{assetId}/assign")
    public ApiResponse<Map<String, Object>> assignAsset(
            @PathVariable String assetId, @RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = assetService.assignAsset(assetId, body.get("employeeId"));
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{assetId}/return")
    public ApiResponse<Map<String, Object>> returnAsset(@PathVariable String assetId) {
        try {
            Map<String, Object> result = assetService.returnAsset(assetId);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
