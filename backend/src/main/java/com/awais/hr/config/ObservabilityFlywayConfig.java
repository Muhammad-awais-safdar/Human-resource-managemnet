package com.awais.hr.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Configuration
@ConditionalOnProperty(name = "observability.datasource.enabled", havingValue = "true", matchIfMissing = false)
public class ObservabilityFlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(ObservabilityFlywayConfig.class);

    @Value("${observability.datasource.url:jdbc:postgresql://localhost:5432/awais_hr_observability}")
    private String url;

    @Value("${observability.datasource.username:postgres}")
    private String username;

    @Value("${observability.datasource.password:root}")
    private String password;

    @Bean(name = "observabilityFlyway")
    public Flyway observabilityFlyway() {
        log.info("Initializing dedicated Flyway migration for Observability/Logs DB: {}", url);
        try {
            ensureDatabaseExists();

            DataSource observabilityDs = DataSourceBuilder.create()
                    .url(url)
                    .username(username)
                    .password(password)
                    .build();

            Flyway flyway = Flyway.configure()
                    .dataSource(observabilityDs)
                    .locations("classpath:db/migration/observability")
                    .baselineOnMigrate(true)
                    .load();

            flyway.migrate();
            log.info("Dedicated Observability Flyway migration completed successfully for: {}", url);
            return flyway;
        } catch (Exception e) {
            log.warn("Observability Flyway migration note: {}", e.getMessage());
            return null;
        }
    }

    private void ensureDatabaseExists() {
        try {
            int lastSlashIndex = url.lastIndexOf('/');
            if (lastSlashIndex > 0) {
                String baseUrl = url.substring(0, lastSlashIndex + 1);
                String dbName = url.substring(lastSlashIndex + 1);
                String adminUrl = baseUrl + "postgres";

                try (Connection conn = DriverManager.getConnection(adminUrl, username, password);
                     Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("CREATE DATABASE " + dbName);
                    log.info("Created dedicated Observability database: {}", dbName);
                } catch (Exception ignored) {
                    // Database likely already exists
                }
            }
        } catch (Exception ignored) {}
    }
}
