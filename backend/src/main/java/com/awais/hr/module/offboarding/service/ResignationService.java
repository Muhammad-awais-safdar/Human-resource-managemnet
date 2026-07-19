package com.awais.hr.module.offboarding.service;

import com.awais.hr.module.offboarding.dto.ResignationRequestDTO;
import java.util.*;

public interface ResignationService {
    List<Map<String, Object>> getResignations(String email);
    void submitResignation(String email, ResignationRequestDTO dto);
    void deleteResignation(String id);
    void settleResignation(String id, String exitFeedback, double customSettlement);
}
