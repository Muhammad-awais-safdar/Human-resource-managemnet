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
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/manufacturing")
public class ManufacturingModuleController {

    private final DataSource dataSource;
    private final PieceRateEngine pieceRateEngine;

    public ManufacturingModuleController(DataSource dataSource, PieceRateEngine pieceRateEngine) {
        this.dataSource = dataSource;
        this.pieceRateEngine = pieceRateEngine;
    }

    @GetMapping("/metrics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getManufacturingMetrics() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> stats = jdbcTemplate.queryForList(
                "SELECT COALESCE(SUM(quantity), 0) as total_units, COALESCE(SUM(total_pay), 0) as total_wages, COUNT(*) as entries " +
                "FROM piece_rate_entry WHERE production_unit = 'ASSEMBLY_PART'"
        );

        double totalUnits = stats.isEmpty() ? 0 : ((Number) stats.get(0).getOrDefault("total_units", 0)).doubleValue();
        double totalWages = stats.isEmpty() ? 0 : ((Number) stats.get(0).getOrDefault("total_wages", 0)).doubleValue();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "todayTotalUnitsProduced", totalUnits,
                "totalPieceRateLaborDisbursement", totalWages,
                "pieceRateEntries", stats.isEmpty() ? 0 : stats.get(0).getOrDefault("entries", 0)
        ));
    }

    @GetMapping("/piece-rate-wages")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getPieceRateWages() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        List<Map<String, Object>> wages = pieceRateEngine.getByProductionUnit("ASSEMBLY_PART");
        return ResponseEntity.ok(Map.of("success", true, "pieceRateWages", wages));
    }

    @PostMapping("/piece-rate-wages")
    @HasPermission("payroll:process")
    public ResponseEntity<?> logPieceRateOutput(@RequestBody Map<String, Object> payload) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        String employeeId = (String) payload.getOrDefault("employeeId", "EMP-MFG-01");
        int units = Integer.parseInt(payload.getOrDefault("unitsProduced", "0").toString());
        BigDecimal rate = new BigDecimal(payload.getOrDefault("pieceRatePerUnit", "2.00").toString());
        BigDecimal qualityFactor = new BigDecimal(payload.getOrDefault("qualityFactor", "1.0").toString());

        String recordId = pieceRateEngine.recordPieceRateOutput(
                employeeId, "ASSEMBLY_PART", units, rate, qualityFactor, LocalDate.now()
        );

        BigDecimal totalWage = pieceRateEngine.calculatePiecePay(units, rate, qualityFactor);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "recordId", recordId,
                "employeeId", employeeId,
                "unitsProduced", units,
                "pieceRatePerUnit", rate,
                "qualityFactor", qualityFactor,
                "totalWage", totalWage
        ));
    }
}
