package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.engine.piecerate.PieceRateEngine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

/**
 * AgritechCropYieldController — all monetary calculations use BigDecimal exclusively.
 * Harvest logs are persisted to the database via PieceRateEngine (not in-memory).
 */
@RestController
@RequestMapping("/api/v1/agritech")
public class AgritechCropYieldController {

    private final DataSource dataSource;
    private final PieceRateEngine pieceRateEngine;

    public AgritechCropYieldController(DataSource dataSource, PieceRateEngine pieceRateEngine) {
        this.dataSource = dataSource;
        this.pieceRateEngine = pieceRateEngine;
    }

    @GetMapping("/metrics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getAgritechMetrics() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> stats = jdbcTemplate.queryForList(
                "SELECT COALESCE(SUM(quantity), 0) as total_yield_kg, COALESCE(SUM(total_pay), 0) as total_labor_cost, COUNT(*) as entries " +
                "FROM piece_rate_entry WHERE production_unit = 'HARVEST_KG'"
        );

        // Use BigDecimal for aggregated monetary totals — never double
        BigDecimal totalLaborCost = stats.isEmpty() ? BigDecimal.ZERO
                : new BigDecimal(stats.get(0).getOrDefault("total_labor_cost", "0").toString()).setScale(2, RoundingMode.HALF_UP);
        long totalYieldKg = stats.isEmpty() ? 0
                : ((Number) stats.get(0).getOrDefault("total_yield_kg", 0)).longValue();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalHarvestKg", totalYieldKg,
                "totalLaborDisbursements", totalLaborCost,
                "harvestEntries", stats.isEmpty() ? 0 : stats.get(0).getOrDefault("entries", 0),
                "dataSource", "LIVE_DB"
        ));
    }

    @GetMapping("/harvest-logs")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getHarvestLogs() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        List<Map<String, Object>> logs = pieceRateEngine.getByProductionUnit("HARVEST_KG");
        return ResponseEntity.ok(Map.of("success", true, "harvestLogs", logs));
    }

    @PostMapping("/harvest-logs")
    @HasPermission("payroll:process")
    public ResponseEntity<?> recordHarvestLog(@RequestBody Map<String, Object> payload) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        String workerId = (String) payload.getOrDefault("workerId", "EMP-FARM-01");

        // All monetary inputs parsed as BigDecimal — no double
        BigDecimal yieldWeightKg    = new BigDecimal(payload.getOrDefault("yieldWeightKg", "0").toString());
        BigDecimal ratePerKg        = new BigDecimal(payload.getOrDefault("pieceRateWagePerKg", "0").toString());
        BigDecimal qualityFactor    = new BigDecimal(payload.getOrDefault("qualityFactor", "1.0").toString());

        if (yieldWeightKg.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "yieldWeightKg must be greater than zero."));
        }
        if (ratePerKg.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "pieceRateWagePerKg must be greater than zero."));
        }

        // Convert yield to integer quantity (grams or whole kg based on scale)
        int quantityKg = yieldWeightKg.setScale(0, RoundingMode.HALF_UP).intValue();
        BigDecimal totalLaborCost = pieceRateEngine.calculatePiecePay(quantityKg, ratePerKg, qualityFactor);

        String recordId = pieceRateEngine.recordPieceRateOutput(
                workerId, "HARVEST_KG", quantityKg, ratePerKg, qualityFactor, LocalDate.now()
        );

        return ResponseEntity.ok(Map.of(
                "success",       true,
                "recordId",      recordId,
                "workerId",      workerId,
                "yieldWeightKg", yieldWeightKg,
                "ratePerKg",     ratePerKg,
                "qualityFactor", qualityFactor,
                "totalLaborCost", totalLaborCost
        ));
    }
}
