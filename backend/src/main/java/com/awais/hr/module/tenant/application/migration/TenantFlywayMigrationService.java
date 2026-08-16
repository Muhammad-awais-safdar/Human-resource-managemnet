package com.awais.hr.module.tenant.application.migration;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;

/**
 * Service orchestrating dynamic Flyway database migrations for tenant schemas.
 */
@Service
public class TenantFlywayMigrationService {

    private static final Logger log = LoggerFactory.getLogger(TenantFlywayMigrationService.class);

    public void migrateTenantDatabase(DataSource dataSource, String schemaName) {
        log.info("Executing Flyway migrations for tenant schema: {}", schemaName);
        try {
            Flyway flyway = Flyway.configure()
                    .dataSource(dataSource)
                    .schemas(schemaName)
                    .locations("classpath:db/migration/tenant/core", "classpath:db/migration/tenant")
                    .baselineOnMigrate(true)
                    .load();

            flyway.migrate();
            log.info("Successfully completed Flyway migrations for tenant schema: {}", schemaName);
        } catch (Exception e) {
            log.error("Failed Flyway migration for tenant schema {}: {}", schemaName, e.getMessage(), e);
            throw new RuntimeException("Tenant database migration failed for schema: " + schemaName, e);
        }
    }
}
