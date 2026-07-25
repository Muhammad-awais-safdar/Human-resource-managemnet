package com.awais.hr.module.observability;

import com.awais.hr.module.observability.service.LogStreamManager;
import com.awais.hr.module.observability.service.ObservabilityService;
import com.awais.hr.module.observability.service.ObservabilityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class ObservabilityServiceTest {

    @Mock
    private DataSource dataSource;

    private LogStreamManager logStreamManager;
    private ObservabilityService observabilityService;

    @BeforeEach
    public void setUp() {
        logStreamManager = new LogStreamManager();
        observabilityService = new ObservabilityServiceImpl(dataSource, logStreamManager);
    }

    @Test
    public void getTailLogs_shouldReturnRingBufferEntries() {
        logStreamManager.addLog("INFO", "payroll", "acme", "tr-100", "Payroll run executed", "192.168.1.1");
        List<Map<String, Object>> tail = observabilityService.getTailLogs(10);
        assertNotNull(tail);
        assertFalse(tail.isEmpty());
        assertTrue(tail.stream().anyMatch(l -> "payroll".equals(l.get("module"))));
    }

    @Test
    public void streamLiveLogs_shouldCreateValidSseEmitter() {
        SseEmitter emitter = observabilityService.streamLiveLogs();
        assertNotNull(emitter);
    }

    @Test
    public void saveAlertRule_shouldReturnFormattedAlertRuleMap() {
        Map<String, Object> input = Map.of(
                "ruleName", "High P95 Latency",
                "thresholdValue", 450.0,
                "notificationChannel", "SLACK"
        );
        Map<String, Object> result = observabilityService.saveAlertRule(input);
        assertNotNull(result);
        assertEquals("High P95 Latency", result.get("ruleName"));
        assertEquals("ACTIVE", result.get("status"));
    }

    @Test
    public void recordAuditLog_shouldAddLogToStreamManager() {
        observabilityService.recordAuditLog("acme", "usr-1", "req-1", "tr-1", "employee", "CREATE", "Employee", "emp-101", null, "{\"name\":\"John\"}", "127.0.0.1", "Mozilla");
        List<Map<String, Object>> tail = observabilityService.getTailLogs(50);
        assertTrue(tail.stream().anyMatch(l -> l.get("message") != null && l.get("message").toString().contains("CREATE on Employee")));
    }
}
