package com.awais.hr.module.compliance;

import com.awais.hr.module.compliance.service.ComplianceManagementService;
import com.awais.hr.module.compliance.service.ComplianceManagementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class ComplianceManagementTest {

    @Mock
    private DataSource dataSource;

    private ComplianceManagementService complianceService;

    @BeforeEach
    public void setUp() {
        complianceService = new ComplianceManagementServiceImpl(dataSource);
    }

    @Test
    public void createChecklist_shouldThrowException_whenTitleIsBlank() {
        Map<String, Object> body = Map.of("title", "");
        assertThrows(IllegalArgumentException.class, () -> complianceService.createChecklist(body));
    }

    @Test
    public void createRiskAssessment_shouldThrowException_whenTopicIsBlank() {
        Map<String, Object> body = Map.of("topic", "   ");
        assertThrows(IllegalArgumentException.class, () -> complianceService.createRiskAssessment(body));
    }
}
