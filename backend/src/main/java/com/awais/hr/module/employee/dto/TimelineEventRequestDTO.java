package com.awais.hr.module.employee.dto;

import lombok.Data;

@Data
public class TimelineEventRequestDTO {
    private String employeeId;
    private String type;
    private String description;
    private String effectiveDate;
}
