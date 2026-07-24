package com.awais.hr.module.approvals;

import com.awais.hr.module.approvals.service.UnifiedApprovalService;
import com.awais.hr.module.approvals.service.UnifiedApprovalServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class UnifiedApprovalTest {

    @Mock
    private DataSource dataSource;

    private UnifiedApprovalService approvalService;

    @BeforeEach
    public void setUp() {
        approvalService = new UnifiedApprovalServiceImpl(dataSource);
    }

    @Test
    public void delegateApproval_shouldThrowException_whenEmailsAreBlank() {
        Map<String, Object> body = Map.of("delegatorEmail", " ", "delegateeEmail", " ");
        assertThrows(IllegalArgumentException.class, () -> approvalService.delegateApproval(body));
    }
}
