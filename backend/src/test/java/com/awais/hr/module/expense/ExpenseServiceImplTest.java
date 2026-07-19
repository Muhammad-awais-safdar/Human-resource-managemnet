package com.awais.hr.module.expense;

import com.awais.hr.module.expense.service.ExpenseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import javax.sql.DataSource;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ExpenseServiceImplTest {

    @Mock private DataSource dataSource;
    private ExpenseServiceImpl service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new ExpenseServiceImpl(dataSource);
    }

    @Test
    public void testService_instantiated() {
        assertNotNull(service);
    }
}
