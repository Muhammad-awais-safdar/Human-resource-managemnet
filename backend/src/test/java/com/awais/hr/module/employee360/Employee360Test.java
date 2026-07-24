package com.awais.hr.module.employee360;

import com.awais.hr.module.employee360.service.Employee360Service;
import com.awais.hr.module.employee360.service.Employee360ServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class Employee360Test {

    @Mock
    private DataSource dataSource;

    private Employee360Service emp360Service;

    @BeforeEach
    public void setUp() {
        emp360Service = new Employee360ServiceImpl(dataSource);
    }

    @Test
    public void addManagerNote_shouldThrowException_whenContentIsBlank() {
        Map<String, Object> body = Map.of("employeeId", "emp-101", "noteContent", " ");
        assertThrows(IllegalArgumentException.class, () -> emp360Service.addManagerNote(body));
    }
}
