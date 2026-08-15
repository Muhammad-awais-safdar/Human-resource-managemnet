package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.engine.commission.CommissionEngine;
import com.awais.hr.engine.roster.RosterEngine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/retail")
public class RetailModuleController {

    private final DataSource dataSource;
    private final CommissionEngine commissionEngine;
    private final RosterEngine rosterEngine;

    public RetailModuleController(DataSource dataSource, CommissionEngine commissionEngine, RosterEngine rosterEngine) {
        this.dataSource = dataSource;
        this.commissionEngine = commissionEngine;
        this.rosterEngine = rosterEngine;
    }

    @GetMapping("/metrics")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getRetailMetrics() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> commissions = jdbcTemplate.queryForList(
                "SELECT COALESCE(SUM(commission_amount), 0) as total_commission, COUNT(*) as total_entries FROM pos_commission"
        );
        double totalCommission = commissions.isEmpty() ? 0 : ((Number) commissions.get(0).getOrDefault("total_commission", 0)).doubleValue();
        long totalEntries = commissions.isEmpty() ? 0 : ((Number) commissions.get(0).getOrDefault("total_entries", 0)).longValue();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalPosCommissionEntries", totalEntries,
                "totalEarnedCommissions", totalCommission,
                "openShiftSlots", rosterEngine.getOpenShifts("RETAIL").size()
        ));
    }

    @GetMapping("/pos-commissions")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getPosCommissions() {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> commissions = jdbcTemplate.queryForList(
                "SELECT id, employee_id, sales_amount, commission_rate, commission_amount, log_date FROM pos_commission ORDER BY log_date DESC LIMIT 50"
        );
        return ResponseEntity.ok(Map.of("success", true, "commissions", commissions));
    }

    @PostMapping("/pos-commissions")
    @HasPermission("payroll:process")
    public ResponseEntity<?> logPosSales(@RequestBody Map<String, Object> payload) {
        String tenantId = TenantContextHolder.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "No active tenant context."));

        String employeeId = (String) payload.getOrDefault("employeeId", "EMP-RETAIL-01");
        BigDecimal sales = new BigDecimal(payload.getOrDefault("salesAmount", "0").toString());
        BigDecimal commissionRate = new BigDecimal(payload.getOrDefault("commissionRatePct", "3.5").toString());

        BigDecimal commission = commissionEngine.calculateCommission(sales, commissionRate, BigDecimal.ONE);

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO pos_commission (id, employee_id, sales_amount, commission_rate, commission_amount, log_date) " +
                "VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING",
                id, employeeId, sales, commissionRate, commission, Date.valueOf(LocalDate.now())
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "recordId", id,
                "employeeId", employeeId,
                "salesAmount", sales,
                "commissionRatePct", commissionRate,
                "earnedCommission", commission
        ));
    }

    @GetMapping("/shift-bidding")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> getOpenShiftBidding() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "openShifts", rosterEngine.getOpenShifts("RETAIL")
        ));
    }

    @PostMapping("/shift-bid")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<?> createOpenShift(@RequestBody Map<String, Object> body) {
        String shiftDate = (String) body.getOrDefault("shiftDate", LocalDate.now().toString());
        String start = (String) body.getOrDefault("startTime", "08:00");
        String end = (String) body.getOrDefault("endTime", "16:00");
        String id = rosterEngine.createOpenShift(LocalDate.parse(shiftDate), start, end, "RETAIL", null);
        return ResponseEntity.ok(Map.of("success", true, "shiftId", id));
    }
}
