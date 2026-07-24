package com.awais.hr.module.auditcenter;

import com.awais.hr.module.auditcenter.service.AuditCenterService;
import com.awais.hr.module.auditcenter.service.AuditCenterServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class AuditCenterTest {

    @Mock
    private DataSource dataSource;

    private AuditCenterService auditCenterService;

    @BeforeEach
    public void setUp() {
        auditCenterService = new AuditCenterServiceImpl(dataSource);
    }

    @Test
    public void recordAuditLog_shouldThrowException_whenActorIsBlank() {
        Map<String, Object> body = Map.of("actorEmail", " ", "actionType", "UPDATE");
        assertThrows(IllegalArgumentException.class, () -> auditCenterService.recordAuditLog(body));
    }
}
