package com.awais.hr.module.migration;

import com.awais.hr.module.migration.service.DataMigrationService;
import com.awais.hr.module.migration.service.DataMigrationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class DataMigrationTest {

    @Mock
    private DataSource dataSource;

    private DataMigrationService migrationService;

    @BeforeEach
    public void setUp() {
        migrationService = new DataMigrationServiceImpl(dataSource);
    }

    @Test
    public void executeMigrationJob_shouldThrowException_whenTotalRecordsZeroOrNegative() {
        Map<String, Object> body = Map.of("totalRecords", 0);
        assertThrows(IllegalArgumentException.class, () -> migrationService.executeMigrationJob(body));
    }
}
