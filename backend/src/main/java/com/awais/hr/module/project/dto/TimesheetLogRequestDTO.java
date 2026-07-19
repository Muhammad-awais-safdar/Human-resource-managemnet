package com.awais.hr.module.project.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TimesheetLogRequestDTO {
    private String projectId;
    private BigDecimal hours;
    private String date;
}
