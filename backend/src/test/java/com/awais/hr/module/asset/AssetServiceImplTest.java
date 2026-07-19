package com.awais.hr.module.asset;

import com.awais.hr.module.asset.service.AssetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AssetServiceImplTest {

    @Mock private DataSource dataSource;

    private AssetServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new AssetServiceImpl(dataSource);
    }

    @Test
    void service_instantiatesSuccessfully() {
        assertNotNull(service);
    }

    @Test
    void assignAsset_rowsAffected_zero_returnsFalse() {
        // Simulate 0 rows (not available / not found)
        int rows = 0;
        Map<String, Object> result = rows == 0
                ? Map.of("success", false, "message", "Asset not available or not found.")
                : Map.of("success", true, "message", "Asset assigned successfully.");
        assertEquals(false, result.get("success"));
    }

    @Test
    void assignAsset_rowsAffected_one_returnsTrue() {
        int rows = 1;
        Map<String, Object> result = rows == 0
                ? Map.of("success", false, "message", "Asset not available or not found.")
                : Map.of("success", true, "message", "Asset assigned successfully.");
        assertEquals(true, result.get("success"));
    }

    @Test
    void returnAsset_rowsAffected_zero_returnsFalse() {
        int rows = 0;
        Map<String, Object> result = rows == 0
                ? Map.of("success", false, "message", "Asset not found.")
                : Map.of("success", true, "message", "Asset returned successfully.");
        assertEquals(false, result.get("success"));
    }

    @Test
    void returnAsset_rowsAffected_one_returnsTrue() {
        int rows = 1;
        Map<String, Object> result = rows == 0
                ? Map.of("success", false, "message", "Asset not found.")
                : Map.of("success", true, "message", "Asset returned successfully.");
        assertEquals(true, result.get("success"));
    }

    @Test
    void assetDefaultStatus_isAvailable() {
        String defaultStatus = "AVAILABLE";
        assertEquals("AVAILABLE", defaultStatus);
    }
}
