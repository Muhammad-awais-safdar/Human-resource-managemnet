package com.awais.hr.module.bankpayroll;

import com.awais.hr.module.bankpayroll.service.BankPayrollService;
import com.awais.hr.module.bankpayroll.service.BankPayrollServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class BankPayrollTest {

    @Mock
    private DataSource dataSource;

    private BankPayrollService bankPayrollService;

    @BeforeEach
    public void setUp() {
        bankPayrollService = new BankPayrollServiceImpl(dataSource);
    }

    @Test
    public void createBatch_shouldThrowException_whenNameIsBlank() {
        Map<String, Object> body = Map.of("batchName", " ");
        assertThrows(IllegalArgumentException.class, () -> bankPayrollService.createBatch(body));
    }
}
