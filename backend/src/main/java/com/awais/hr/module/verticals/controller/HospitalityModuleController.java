package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.engine.commission.CommissionEngine;
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
@RequestMapping("/api/v1/hospitality")
public class HospitalityModuleController {

    private final DataSource dataSource;
    private final CommissionEngine commissionEngine;
    private final PieceRateEngine pieceRateEngine;

    public HospitalityModuleController(DataSource dataSource, CommissionEngine commissionEngine, PieceRateEngine pieceRateEngine) {
        this.dataSource = dataSource;
        this.commissionEngine = commissionEngine;
        this.pieceRateEngine = pieceRateEngine;
    }

    @GetMapping("/metrics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getHospitalityMetrics() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> tipStats = jdbcTemplate.queryForList(
                "SELECT COALESCE(SUM(total_pay), 0) as total_gratuity, COUNT(*) as entries FROM piece_rate_entry WHERE production_unit = 'TIP_POOL_SHARE'"
        );
        double totalGratuity = tipStats.isEmpty() ? 0 : ((Number) tipStats.get(0).getOrDefault("total_gratuity", 0)).doubleValue();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalGratuityDistributed", totalGratuity,
                "tipPoolEntries", tipStats.isEmpty() ? 0 : tipStats.get(0).getOrDefault("entries", 0)
        ));
    }

    @GetMapping("/tip-pools")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getTipPools() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> pools = jdbcTemplate.queryForList(
                "SELECT id, employee_id, production_unit, quantity, unit_rate, quality_factor, total_pay, work_date " +
                "FROM piece_rate_entry WHERE production_unit = 'TIP_POOL_SHARE' ORDER BY work_date DESC LIMIT 50"
        );
        return ResponseEntity.ok(Map.of("success", true, "tipPools", pools));
    }

    @PostMapping("/tip-pools")
    @HasPermission("payroll:process")
    public ResponseEntity<?> recordTipDistribution(@RequestBody Map<String, Object> payload) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        String employeeId = (String) payload.getOrDefault("employeeId", "EMP-HOSP-01");
        BigDecimal totalGratuity = new BigDecimal(payload.getOrDefault("totalGratuityCollected", "0").toString());
        int staffCount = Integer.parseInt(payload.getOrDefault("staffCount", "1").toString());

        BigDecimal perStaffShare = staffCount > 0
                ? totalGratuity.divide(BigDecimal.valueOf(staffCount), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String recordId = pieceRateEngine.recordPieceRateOutput(
                employeeId, "TIP_POOL_SHARE", staffCount, perStaffShare, BigDecimal.ONE, LocalDate.now()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "recordId", recordId,
                "totalGratuityDistributed", totalGratuity,
                "staffCount", staffCount,
                "perStaffShare", perStaffShare
        ));
    }
}
