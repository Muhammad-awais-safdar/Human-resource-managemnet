package com.awais.hr.module.document.dto;

import lombok.Data;

@Data
public class DocumentUploadRequestDTO {
    private String name;
    private String url;
    private String expiryDate;
}
