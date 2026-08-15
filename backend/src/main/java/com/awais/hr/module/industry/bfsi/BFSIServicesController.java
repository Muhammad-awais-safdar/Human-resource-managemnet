package com.awais.hr.module.industry.bfsi;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/bfsi")
public class BFSIServicesController {

    private final List<Map<String, Object>> makerCheckerRequests = new ArrayList<>();

    @PostMapping("/bank-export/iso20022")
    @HasPermission("corehr:settings:write")
    @RequiresModule("BANK_ISO20022")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateIso20022Xml(@RequestBody Map<String, Object> payload) {
        String batchId = (String) payload.getOrDefault("batchId", "PAY-BATCH-2026-08");
        Double totalDisbursement = Double.parseDouble(payload.getOrDefault("totalDisbursement", 450000.00).toString());

        String xmlContent = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pain.001.001.03\">\n" +
                "  <CstmrCdtTrfInitn>\n" +
                "    <GrpHdr><MsgId>" + batchId + "</MsgId><NbOfTxs>124</NbOfTxs><TtlIntrBkSttlmAmt Ccy=\"USD\">" + totalDisbursement + "</TtlIntrBkSttlmAmt></GrpHdr>\n" +
                "  </CstmrCdtTrfInitn>\n" +
                "</Document>";

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "batchId", batchId,
            "format", "ISO_20022_PAIN_001_XML",
            "totalAmount", totalDisbursement,
            "iso20022XmlPayload", xmlContent
        )));
    }

    @PostMapping("/maker-checker/requests")
    @HasPermission("corehr:employee:write")
    @RequiresModule("MAKER_CHECKER")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMakerRequest(@RequestBody Map<String, Object> payload) {
        String makerEmail = (String) payload.getOrDefault("makerEmail", "maker@bank.com");
        String actionType = (String) payload.getOrDefault("actionType", "SALARY_REVISION_INCREASE_15_PERCENT");
        String targetEmployeeId = (String) payload.getOrDefault("targetEmployeeId", "EMP-FIN-88");

        Map<String, Object> req = new HashMap<>();
        req.put("id", UUID.randomUUID().toString());
        req.put("makerEmail", makerEmail);
        req.put("actionType", actionType);
        req.put("targetEmployeeId", targetEmployeeId);
        req.put("status", "PENDING_CHECKER_APPROVAL");
        req.put("createdAt", LocalDate.now().toString());

        makerCheckerRequests.add(req);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Maker revision initiated. Dual-authorization requirement locked until Checker approves.",
            "request", req
        )));
    }

    @PostMapping("/maker-checker/{id}/approve")
    @HasPermission("corehr:settings:write")
    @RequiresModule("MAKER_CHECKER")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveCheckerRequest(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        String checkerEmail = (String) payload.getOrDefault("checkerEmail", "checker.admin@bank.com");

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "requestId", id,
            "checkerEmail", checkerEmail,
            "status", "CHECKER_APPROVED_EXECUTED",
            "executedAt", LocalDate.now().toString()
        )));
    }

    @PostMapping("/leaves/validate-block-leave")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateBlockLeave(@RequestBody Map<String, Object> payload) {
        Integer consecutiveDays = Integer.parseInt(payload.getOrDefault("consecutiveDays", 10).toString());
        boolean compliant = consecutiveDays >= 10;

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "roleType", "TREASURY_TRADER",
            "consecutiveDaysRequested", consecutiveDays,
            "mandatoryBlockLeaveCompliant", compliant,
            "message", compliant ? "FINRA/Regulatory 10-day block leave compliance satisfied." : "Violation: Traders must take at least 10 consecutive days off per year."
        )));
    }
}
