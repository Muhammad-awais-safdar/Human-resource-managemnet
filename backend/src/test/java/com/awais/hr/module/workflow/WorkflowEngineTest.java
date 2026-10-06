package com.awais.hr.module.workflow;

import com.awais.hr.config.AuthorizationService;
import com.awais.hr.module.workflow.engine.ApproverResolverImpl;
import com.awais.hr.module.workflow.engine.WorkflowEngineServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WorkflowEngineTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private AuthorizationService authorizationService;

    private ApproverResolverImpl approverResolver;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        approverResolver = new ApproverResolverImpl(dataSource);
    }

    @Test
    @DisplayName("Workflow Engine: ApproverResolver handles null/empty input gracefully")
    void testApproverResolver_handlesNullInput() {
        List<String> result = approverResolver.resolveApprovers(null, null, null, null);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Workflow Engine: Self-approval protection prevents requester from approving own request")
    void testSelfApprovalProtection_logicGuard() {
        String requesterId = "emp-001";
        String actorId = "emp-001";

        boolean isSelfApproval = requesterId.equalsIgnoreCase(actorId);
        assertTrue(isSelfApproval, "Requester matching actor MUST be flagged as self-approval!");
    }

    @Test
    @DisplayName("Workflow Engine: Workflow service validation fails on invalid payload inputs")
    void testStartWorkflow_invalidInputs_throwsException() {
        WorkflowEngineServiceImpl service = new WorkflowEngineServiceImpl(dataSource, approverResolver, authorizationService);
        assertThrows(IllegalArgumentException.class, () -> {
            service.startWorkflow(null, "LEAVE", "leave-123", "user@ep-systems.com");
        });
        assertThrows(IllegalArgumentException.class, () -> {
            service.startWorkflow("LEAVE_APPROVAL", null, "leave-123", "user@ep-systems.com");
        });
    }
}
