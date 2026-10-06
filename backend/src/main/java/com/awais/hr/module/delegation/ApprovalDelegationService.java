package com.awais.hr.module.delegation;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface ApprovalDelegationService {

    /**
     * Create a new time-bound, permission-aware approval delegation.
     */
    Map<String, Object> createDelegation(String delegatorEmail, String delegateeEmail, String scope, String reason, Date effectiveFrom, Date effectiveUntil);

    /**
     * Revoke an active approval delegation.
     */
    Map<String, Object> revokeDelegation(String delegationId, String actorEmail);

    /**
     * Retrieve all active delegations created by delegator.
     */
    List<Map<String, Object>> getActiveDelegationsForDelegator(String delegatorEmail);

    /**
     * Retrieve all active delegations assigned to delegatee.
     */
    List<Map<String, Object>> getActiveDelegationsForDelegatee(String delegateeEmail);

    /**
     * Check if a delegatee currently holds valid, active delegated approval authority for a delegator.
     */
    boolean isDelegatedApprover(String delegateeEmail, String delegatorEmail, String scope);
}
