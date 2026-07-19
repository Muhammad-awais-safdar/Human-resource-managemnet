package com.awais.hr.module.leave.service;

import com.awais.hr.module.leave.dto.LeaveRequestDTO;
import com.awais.hr.module.leave.dto.LeaveStatusUpdateDTO;
import java.util.List;
import java.util.Map;

public interface LeaveService {
    List<Map<String, Object>> getPolicies();
    List<Map<String, Object>> getRequests(String email);
    void submitRequest(String email, LeaveRequestDTO dto);
    void updateRequestStatus(String approverEmail, String id, LeaveStatusUpdateDTO dto);
    void deleteRequest(String id);
}
