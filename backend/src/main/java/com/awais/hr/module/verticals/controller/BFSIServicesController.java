package com.awais.hr.module.verticals.controller;

import com.awais.hr.config.HasPermission;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/bfsi")
public class BFSIServicesController {

    private final DataSource dataSource;

    public BFSIServicesController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // 1. Direct Bank Disbursement ISO 20022 pain.001 XML Gateway
    @PostMapping("/disbursement/iso20022-xml")
    @HasPermission("payroll:process")
    public ResponseEntity<?> generateIso20022Xml(@RequestBody Map<String, Object> body) {
        String batchId = (String) body.getOrDefault("batchId", UUID.randomUUID().toString());
        String debtorIban = (String) body.getOrDefault("debtorIban", "PK36RAAST000000123456789");
        BigDecimal totalAmount = new BigDecimal(body.getOrDefault("totalAmount", "50000.00").toString());

        // Construct valid ISO 20022 pain.001.001.03 XML document
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pain.001.001.03\">\n");
        xml.append("  <CstmrCdtTrfInitn>\n");
        xml.append("    <GrpHdr>\n");
        xml.append("      <MsgId>ISO20022-").append(batchId.substring(0, 8)).append("</MsgId>\n");
        xml.append("      <CreDtTm>").append(Instant.now().toString()).append("</CreDtTm>\n");
        xml.append("      <NbOfTxs>1</NbOfTxs>\n");
        xml.append("      <CtrlSum>").append(totalAmount).append("</CtrlSum>\n");
        xml.append("      <InitgPty><Nm>Awais HR SaaS Platform</Nm></InitgPty>\n");
        xml.append("    </GrpHdr>\n");
        xml.append("    <PmtInf>\n");
        xml.append("      <PmtInfId>PMT-").append(batchId.substring(0, 8)).append("</PmtInfId>\n");
        xml.append("      <PmtMtd>TRF</PmtMtd>\n");
        xml.append("      <Dbtr><Nm>Enterprise Corp</Nm></Dbtr>\n");
        xml.append("      <DbtrAcct><Id><IBAN>").append(debtorIban).append("</IBAN></Id></DbtrAcct>\n");
        xml.append("    </PmtInf>\n");
        xml.append("  </CstmrCdtTrfInitn>\n");
        xml.append("</Document>");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "batchId", batchId,
                "format", "ISO 20022 pain.001.001.03",
                "xmlContent", xml.toString()
        ));
    }

    // 2. Maker-Checker Dual-Authorization Enforcement
    @PostMapping("/maker-checker/request")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createMakerCheckerRequest(@RequestBody Map<String, String> body) {
        String makerId = body.get("makerEmployeeId");
        String requestType = body.get("requestType");
        String entityId = body.get("entityId");
        String payload = body.get("changePayload");

        if (makerId == null || requestType == null || entityId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "makerEmployeeId, requestType, and entityId are required."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String reqId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO maker_checker_request (id, request_type, maker_employee_id, entity_id, change_payload, status) " +
                "VALUES (?, ?, ?, ?, ?, 'PENDING_CHECKER_APPROVAL')",
                reqId, requestType, makerId, entityId, payload != null ? payload : "{}"
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "requestId", reqId,
                "status", "PENDING_CHECKER_APPROVAL",
                "message", "Maker-Checker dual authorization request created successfully."
        ));
    }

    @PostMapping("/maker-checker/approve")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> approveMakerCheckerRequest(@RequestBody Map<String, String> body) {
        String requestId = body.get("requestId");
        String checkerId = body.get("checkerEmployeeId");

        if (requestId == null || checkerId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "requestId and checkerEmployeeId are required."));
        }

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> reqs = jdbcTemplate.queryForList(
                "SELECT maker_employee_id, status FROM maker_checker_request WHERE id = ?", requestId
        );

        if (reqs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Request not found."));
        }

        String makerId = (String) reqs.get(0).get("maker_employee_id");
        if (makerId.equals(checkerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Dual Authorization Rejection: Maker cannot act as Checker for their own request!"));
        }

        jdbcTemplate.update(
                "UPDATE maker_checker_request SET checker_employee_id = ?, status = 'APPROVED', actioned_at = CURRENT_TIMESTAMP WHERE id = ?",
                checkerId, requestId
        );

        return ResponseEntity.ok(Map.of("success", true, "message", "Maker-Checker request approved successfully by Checker."));
    }

    // 3. Mandatory 10-Day Consecutive Block Leave Validator
    @PostMapping("/block-leave/validate")
    @HasPermission("leave:request:read")
    public ResponseEntity<?> validateBlockLeave(@RequestBody Map<String, Object> body) {
        int requestedDays = Integer.parseInt(body.getOrDefault("requestedDays", "10").toString());
        boolean isSensitiveRole = Boolean.parseBoolean(body.getOrDefault("isSensitiveRole", "true").toString());
        int mandatoryMinimumDays = 10;

        boolean compliant = !isSensitiveRole || requestedDays >= mandatoryMinimumDays;

        return ResponseEntity.ok(Map.of(
                "success", true,
                "compliant", compliant,
                "requestedDays", requestedDays,
                "mandatoryMinimumDays", mandatoryMinimumDays,
                "policyMessage", compliant ? "Leave request satisfies mandatory block leave compliance." : "Non-compliant: Sensitive financial roles require at least 10 consecutive block leave days."
        ));
    }
}
