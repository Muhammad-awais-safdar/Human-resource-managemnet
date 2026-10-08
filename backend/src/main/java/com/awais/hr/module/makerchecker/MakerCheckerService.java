package com.awais.hr.module.makerchecker;

import java.util.List;
import java.util.Map;

public interface MakerCheckerService {

    /**
     * Submit a new dual-control sensitive change request (Maker phase).
     */
    Map<String, Object> createRequest(String requestType, String entityId, String changePayload, String makerEmail);

    /**
     * Submit a new dual-control sensitive change request (Maker phase) with entity type and payload object.
     */
    Map<String, Object> submitRequest(String requestType, String entityType, String entityId, Object payload, String makerEmail);

    /**
     * Approve a pending maker-checker request (Checker phase).
     * Enforces Maker != Checker rule and authorization.
     */
    Map<String, Object> approveRequest(String requestId, String checkerEmail);

    /**
     * Reject a pending maker-checker request.
     */
    Map<String, Object> rejectRequest(String requestId, String checkerEmail, String reason);

    /**
     * Retrieve all pending maker-checker requests actionable by the given user.
     */
    List<Map<String, Object>> getPendingRequests(String checkerEmail);

    /**
     * Retrieve requests created by the given maker.
     */
    List<Map<String, Object>> getMySubmittedRequests(String makerEmail);

    /**
     * Retrieve details of a specific request by ID.
     */
    Map<String, Object> getRequestById(String requestId);
}
