package com.awais.hr.module.report;

import com.awais.hr.module.report.service.ReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ReportServiceImplTest {

    @Mock private DataSource dataSource;
    private ReportServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new ReportServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }

    @Test
    public void testCreateReportDefinition_nullName_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createReportDefinition("admin@test.com", null, "desc", "SELECT 1", null, "CSV", "GENERAL")
        );
        assertTrue(ex.getMessage().contains("Report name is required"));
    }

    @Test
    public void testCreateReportDefinition_blankQueryTemplate_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createReportDefinition("admin@test.com", "My Report", "desc", "  ", null, "CSV", "GENERAL")
        );
        assertTrue(ex.getMessage().contains("Query template is required"));
    }

    @Test
    public void testExportCsv_emptyRowsReturnsEmpty() {
        // Verify that empty result set returns empty CSV string (no NullPointerException)
        // We directly test the logic via a subclass with overridden runReport
        ReportServiceImpl spy = new ReportServiceImpl(dataSource) {
            @Override
            public List<Map<String, Object>> runReport(String reportId, Map<String, Object> parameters) {
                return List.of(); // Simulate empty result
            }
        };
        String csv = spy.exportReportCsv("test-id", Map.of());
        assertEquals("", csv);
    }

    @Test
    public void testExportCsv_singleRowGeneratesHeaderAndData() {
        ReportServiceImpl spy = new ReportServiceImpl(dataSource) {
            @Override
            public List<Map<String, Object>> runReport(String reportId, Map<String, Object> parameters) {
                return List.of(Map.of("first_name", "John", "last_name", "Doe", "email", "john@example.com"));
            }
        };
        String csv = spy.exportReportCsv("test-id", Map.of());
        assertNotNull(csv);
        assertTrue(csv.contains("first_name") || csv.contains("last_name") || csv.contains("email"));
        assertTrue(csv.contains("John") || csv.contains("Doe") || csv.contains("john@example.com"));
    }

    @Test
    public void testExportCsv_cellsWithCommasAreQuoted() {
        ReportServiceImpl spy = new ReportServiceImpl(dataSource) {
            @Override
            public List<Map<String, Object>> runReport(String reportId, Map<String, Object> parameters) {
                return List.of(Map.of("note", "Hello, World"));
            }
        };
        String csv = spy.exportReportCsv("test-id", Map.of());
        assertTrue(csv.contains("\"Hello, World\""), "Cells containing commas must be quoted.");
    }
}
