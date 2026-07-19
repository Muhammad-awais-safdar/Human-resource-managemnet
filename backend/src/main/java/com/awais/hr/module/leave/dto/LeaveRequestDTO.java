package com.awais.hr.module.leave.dto;

import lombok.Data;

@Data
public class LeaveRequestDTO {
    private String policyId;
    private String startDate;
    private String endDate;
    private String reason;
}
