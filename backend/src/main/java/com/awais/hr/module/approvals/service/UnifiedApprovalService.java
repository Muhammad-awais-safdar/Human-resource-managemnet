package com.awais.hr.module.approvals.service;

import java.util.List;
import java.util.Map;

public interface UnifiedApprovalService {
    Map<String, Object> getPendingCounts();
    List<Map<String, Object>> getDelegations();
    Map<String, Object> delegateApproval(Map<String, Object> body);
}
