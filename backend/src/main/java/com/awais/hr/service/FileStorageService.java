package com.awais.hr.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(String tenantId, String employeeId, String category, MultipartFile file);
}
