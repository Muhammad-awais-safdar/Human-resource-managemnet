package com.awais.hr.module.search.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.search.service.EnterpriseSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/search")
public class EnterpriseSearchController {

    private final EnterpriseSearchService searchService;

    public EnterpriseSearchController(EnterpriseSearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> search(@RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(searchService.search(query));
    }

    @PostMapping("/index")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> indexEntity(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(searchService.indexEntity(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
