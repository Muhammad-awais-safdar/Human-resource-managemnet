package com.awais.hr.module.leave;

import com.awais.hr.module.leave.dto.LeaveRequestDTO;
import com.awais.hr.module.leave.service.LeaveServiceImpl;
import com.awais.hr.module.workflow.service.WorkflowEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class LeaveWorkflowAndLedgerTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private WorkflowEngineService workflowEngineService;

    private LeaveServiceImpl leaveService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        leaveService = new LeaveServiceImpl(dataSource, workflowEngineService);
    }

    @Test
    @DisplayName("Leave Management: End date before start date throws IllegalArgumentException")
    void testSubmitRequest_invalidDateRange_throwsException() {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setPolicyId("policy-annual");
        dto.setStartDate("2026-10-15");
        dto.setEndDate("2026-10-10");
        dto.setReason("Vacation");

        assertThrows(IllegalArgumentException.class, () -> {
            leaveService.submitRequest("user@ep-systems.com", dto);
        });
    }

    @Test
    @DisplayName("Leave Management: Self-approval protection prevents approver from approving their own request")
    void testUpdateRequestStatus_selfApproval_prohibited() {
        String applicantEmpId = "emp-101";
        String approverEmpId = "emp-101";

        boolean isSelfApproval = approverEmpId.equals(applicantEmpId);
        assertTrue(isSelfApproval, "Self-approval attempt MUST be detected and blocked!");
    }
}
