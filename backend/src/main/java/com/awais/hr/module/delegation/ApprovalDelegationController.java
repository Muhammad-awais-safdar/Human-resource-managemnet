package com.awais.hr.module.delegation;

import com.awais.hr.common.ApiResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/delegation")
@CrossOrigin(origins = "*")
public class ApprovalDelegationController {

    private final ApprovalDelegationService delegationService;

    public ApprovalDelegationController(ApprovalDelegationService delegationService) {
        this.delegationService = delegationService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @PostMapping("/create")
    public ApiResponse<Map<String, Object>> createDelegation(@RequestBody Map<String, Object> payload) {
        try {
            String delegateeEmail = (String) payload.get("delegateeEmail");
            String scope = (String) payload.get("scope");
            String reason = (String) payload.get("reason");
            Map<String, Object> result = delegationService.createDelegation(
                    getAuthenticatedUserEmail(), delegateeEmail, scope, reason, null, null);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/{id}/revoke")
    public ApiResponse<Map<String, Object>> revokeDelegation(@PathVariable("id") String id) {
        try {
            Map<String, Object> result = delegationService.revokeDelegation(id, getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (SecurityException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/my-delegations")
    public ApiResponse<List<Map<String, Object>>> getMyDelegations() {
        try {
            List<Map<String, Object>> list = delegationService.getActiveDelegationsForDelegator(getAuthenticatedUserEmail());
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/assigned-to-me")
    public ApiResponse<List<Map<String, Object>>> getAssignedToMe() {
        try {
            List<Map<String, Object>> list = delegationService.getActiveDelegationsForDelegatee(getAuthenticatedUserEmail());
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
