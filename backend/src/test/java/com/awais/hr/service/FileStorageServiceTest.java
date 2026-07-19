package com.awais.hr.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import static org.junit.jupiter.api.Assertions.*;

public class FileStorageServiceTest {

    private FileStorageServiceImpl storageService;
    private final Path uploadsPath = Paths.get("uploads").toAbsolutePath().normalize();

    @BeforeEach
    public void setUp() throws IOException {
        storageService = new FileStorageServiceImpl();
        if (Files.exists(uploadsPath)) {
            cleanUploadsFolder();
        }
    }

    @AfterEach
    public void tearDown() throws IOException {
        if (Files.exists(uploadsPath)) {
            cleanUploadsFolder();
        }
    }

    private void cleanUploadsFolder() throws IOException {
        Files.walk(uploadsPath)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
    }

    @Test
    public void testStoreFile_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "resume.pdf", 
                "application/pdf", 
                "Dummy content".getBytes()
        );

        String resultPath = storageService.storeFile("tenant123", "emp456", "documents", file);
        
        assertNotNull(resultPath);
        assertTrue(resultPath.contains("tenant_tenant123"));
        assertTrue(resultPath.contains("employee_emp456"));
        assertTrue(resultPath.contains("documents"));
        assertTrue(resultPath.endsWith("resume.pdf"));
        
        Path physicalPath = Paths.get(resultPath).toAbsolutePath().normalize();
        assertTrue(Files.exists(physicalPath));
    }

    @Test
    public void testStoreFile_emptyFileThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "", 
                "text/plain", 
                new byte[0]
        );

        assertThrows(IllegalArgumentException.class, () -> {
            storageService.storeFile("tenant123", "emp456", "documents", file);
        });
    }

    @Test
    public void testStoreFile_sanitizesTraversalFileNames() {
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "../../../etc/passwd", 
                "text/plain", 
                "malicious".getBytes()
        );

        String resultPath = storageService.storeFile("tenant123", "emp456", "documents", file);
        assertNotNull(resultPath);
        assertFalse(resultPath.contains(".."));
        assertTrue(resultPath.contains("passwd"));
    }
}
