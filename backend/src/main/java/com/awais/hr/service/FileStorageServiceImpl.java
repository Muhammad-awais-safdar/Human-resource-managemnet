package com.awais.hr.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path baseStorageDir = Paths.get("uploads").toAbsolutePath().normalize();

    @Override
    public String storeFile(String tenantId, String employeeId, String category, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        try {
            // Clean/Sanitize inputs to prevent directory traversal
            String safeTenant = tenantId != null ? tenantId.replaceAll("[^a-zA-Z0-9_-]", "") : "default";
            String safeEmployee = employeeId != null ? employeeId.replaceAll("[^a-zA-Z0-9_-]", "") : "system";
            String safeCategory = category != null ? category.replaceAll("[^a-zA-Z0-9_-]", "") : "misc";

            // Target path structure: uploads/tenant_[tenant]/employee_[employee]/[category]/[uuid]_[filename]
            Path targetDir = this.baseStorageDir
                    .resolve("tenant_" + safeTenant)
                    .resolve("employee_" + safeEmployee)
                    .resolve(safeCategory)
                    .normalize();

            Files.createDirectories(targetDir);

            String originalName = file.getOriginalFilename();
            String baseName = originalName;
            if (originalName != null) {
                int lastSeparator = Math.max(originalName.lastIndexOf('/'), originalName.lastIndexOf('\\'));
                if (lastSeparator >= 0) {
                    baseName = originalName.substring(lastSeparator + 1);
                }
            }
            String safeFileName = baseName != null ? baseName.replaceAll("[^a-zA-Z0-9\\.\\-_]", "") : "file";
            String uniqueName = UUID.randomUUID().toString() + "_" + safeFileName;

            Path targetFilePath = targetDir.resolve(uniqueName).normalize();

            // Double check that file path is still within our uploads tree (guard against directory traversal)
            if (!targetFilePath.startsWith(this.baseStorageDir)) {
                throw new SecurityException("Cannot store file outside directory structure.");
            }

            Files.copy(file.getInputStream(), targetFilePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative or structured S3-like path that matches our database
            return "uploads/tenant_" + safeTenant + 
                   "/employee_" + safeEmployee + 
                   "/" + safeCategory + 
                   "/" + uniqueName;

        } catch (Exception e) {
            throw new RuntimeException("Could not store file: " + e.getMessage(), e);
        }
    }
}
