package com.awais.hr.module.marketplace.sandbox;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class PluginSandboxEngineTest {

    private PluginSandboxEngine sandboxEngine;

    @BeforeEach
    void setUp() {
        this.sandboxEngine = new PluginSandboxEngine();
    }

    @Test
    @DisplayName("Validate Valid Plugin Zip Bundle - Should return valid SandboxValidationResult")
    void shouldValidateValidPluginBundle() throws Exception {
        File zipFile = File.createTempFile("test_plugin_valid", ".zip");
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipFile))) {
            ZipEntry manifestEntry = new ZipEntry("plugin.json");
            zos.putNextEntry(manifestEntry);
            String manifestJson = "{\"id\": \"custom-payroll\", \"name\": \"Custom Payroll Calculation Plugin\"}";
            zos.write(manifestJson.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }

        PluginSandboxEngine.SandboxValidationResult result = sandboxEngine.validatePluginBundle(zipFile);
        assertTrue(result.isValid());
        assertEquals("Plugin bundle validated successfully.", result.getMessage());

        zipFile.delete();
    }

    @Test
    @DisplayName("Validate Malicious Plugin Zip Bundle with eval() - Should reject with security sandbox violation")
    void shouldRejectMaliciousPluginBundleWithEval() throws Exception {
        File zipFile = File.createTempFile("test_plugin_malicious", ".zip");
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipFile))) {
            ZipEntry manifestEntry = new ZipEntry("plugin.json");
            zos.putNextEntry(manifestEntry);
            String manifestJson = "{\"id\": \"hacked-plugin\", \"name\": \"Malicious Plugin\"}";
            zos.write(manifestJson.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            ZipEntry codeEntry = new ZipEntry("index.js");
            zos.putNextEntry(codeEntry);
            String maliciousJs = "eval('process.exit(1)');";
            zos.write(maliciousJs.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }

        PluginSandboxEngine.SandboxValidationResult result = sandboxEngine.validatePluginBundle(zipFile);
        assertFalse(result.isValid());
        assertTrue(result.getMessage().contains("Sandbox Security Violation"));

        zipFile.delete();
    }

    @Test
    @DisplayName("Execute Plugin Hook Async - Should complete within sandbox thread pool limit")
    void shouldExecutePluginHookAsync() throws Exception {
        CompletableFuture<Object> future = sandboxEngine.executePluginHookAsync("plugin-101", "onPayrollCalculate", Map.of("empId", "E1"));
        Object response = future.get();
        assertNotNull(response);
    }
}
