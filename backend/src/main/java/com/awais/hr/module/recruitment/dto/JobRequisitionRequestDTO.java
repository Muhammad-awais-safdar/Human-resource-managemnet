package com.awais.hr.module.recruitment.dto;

import lombok.Data;

@Data
public class JobRequisitionRequestDTO {
    private String title;
    private String description;
    private Integer openings;
    private String salaryRange;
}
