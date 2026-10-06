package com.awais.hr.module.workflow.engine;

import java.util.List;

public interface ApproverResolver {

    /**
     * Resolve target approver employee IDs for a workflow step given the step configuration and context.
     */
    List<String> resolveApprovers(String approverType, String targetApproverId, String initiatorEmpId, String resourceOwnerEmpId);
}
