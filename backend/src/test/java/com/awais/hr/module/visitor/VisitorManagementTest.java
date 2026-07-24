package com.awais.hr.module.visitor;

import com.awais.hr.module.visitor.service.VisitorService;
import com.awais.hr.module.visitor.service.VisitorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class VisitorManagementTest {

    @Mock
    private DataSource dataSource;

    private VisitorService visitorService;

    @BeforeEach
    public void setUp() {
        visitorService = new VisitorServiceImpl(dataSource);
    }

    @Test
    public void registerVisitor_shouldThrowException_whenNameIsBlank() {
        Map<String, Object> body = Map.of("visitorName", " ");
        assertThrows(IllegalArgumentException.class, () -> visitorService.registerVisitor(body));
    }
}
