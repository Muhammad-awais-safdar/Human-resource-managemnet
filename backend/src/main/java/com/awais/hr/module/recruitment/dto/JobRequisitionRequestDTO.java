package com.awais.hr.module.recruitment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobRequisitionRequestDTO {
    @NotBlank(message = "Job title is required.")
    private String title;

    @NotBlank(message = "Job description is required.")
    private String description;

    @Min(value = 1, message = "Openings must be at least 1.")
    private Integer openings;

    private String salaryRange;
}
