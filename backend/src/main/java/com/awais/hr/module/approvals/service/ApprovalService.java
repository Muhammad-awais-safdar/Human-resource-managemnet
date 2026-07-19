package com.awais.hr.module.approvals.service;

import java.util.List;
import java.util.Map;

public interface ApprovalService {
    List<Map<String, Object>> getPendingApprovals();
    void actionApproval(String type, String id, String action, String comment);
}
