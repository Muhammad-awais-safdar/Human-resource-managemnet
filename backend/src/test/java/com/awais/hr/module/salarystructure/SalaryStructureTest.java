package com.awais.hr.module.salarystructure;

import com.awais.hr.module.salarystructure.service.SalaryStructureService;
import com.awais.hr.module.salarystructure.service.SalaryStructureServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class SalaryStructureTest {

    @Mock
    private DataSource dataSource;

    private SalaryStructureService structureService;

    @BeforeEach
    public void setUp() {
        structureService = new SalaryStructureServiceImpl(dataSource);
    }

    @Test
    public void createComponent_shouldThrowException_whenNameIsBlank() {
        Map<String, Object> body = Map.of("componentName", " ");
        assertThrows(IllegalArgumentException.class, () -> structureService.createComponent(body));
    }
}
