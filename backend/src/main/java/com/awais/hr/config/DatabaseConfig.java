package com.awais.hr.config;

import com.awais.hr.module.tenant.infrastructure.datasource.TenantRoutingDataSource;
import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "com.awais.hr.module",
        entityManagerFactoryRef = "entityManagerFactory",
        transactionManagerRef = "transactionManager"
)
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/awais_hr_master}")
    private String masterUrl;

    @Value("${spring.datasource.username:postgres}")
    private String masterUsername;

    @Value("${spring.datasource.password:root}")
    private String masterPassword;

    @Bean
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties masterDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "masterDataSource")
    public DataSource masterDataSource() {
        ensureMasterDatabaseExists();
        return masterDataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean(name = "masterFlyway")
    public Flyway masterFlyway(@Qualifier("masterDataSource") DataSource masterDataSource) {
        log.info("Executing Master Database Flyway migration against: {}", masterUrl);
        Flyway flyway = Flyway.configure()
                .dataSource(masterDataSource)
                .locations("classpath:db/migration/master")
                .baselineOnMigrate(true)
                .load();
        flyway.repair();
        flyway.migrate();
        log.info("Master Database Flyway migration completed successfully.");
        return flyway;
    }

    private void ensureMasterDatabaseExists() {
        try {
            int lastSlashIndex = masterUrl.lastIndexOf('/');
            if (lastSlashIndex > 0) {
                String baseUrl = masterUrl.substring(0, lastSlashIndex + 1);
                String dbName = masterUrl.substring(lastSlashIndex + 1);
                int queryIndex = dbName.indexOf('?');
                if (queryIndex > 0) {
                    dbName = dbName.substring(0, queryIndex);
                }
                String adminUrl = baseUrl + "postgres";

                try (Connection conn = DriverManager.getConnection(adminUrl, masterUsername, masterPassword);
                     Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("CREATE DATABASE \"" + dbName + "\"");
                    log.info("Created Master database: {}", dbName);
                } catch (Exception ignored) {
                    // Database likely already exists
                }
            }
        } catch (Exception ignored) {}
    }

    @Bean(name = "tenantRoutingDataSource")
    public TenantRoutingDataSource tenantRoutingDataSource(@Qualifier("masterDataSource") DataSource masterDataSource) {
        TenantRoutingDataSource routingDataSource = new TenantRoutingDataSource();
        Map<Object, Object> targetDataSources = new HashMap<>();
        
        // Master database serves as the fallback/default datasource context
        targetDataSources.put("MASTER", masterDataSource);
        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(masterDataSource);
        
        return routingDataSource;
    }

    @Primary
    @Bean(name = "dataSource")
    public DataSource dataSource(TenantRoutingDataSource tenantRoutingDataSource) {
        return tenantRoutingDataSource;
    }

    @Primary
    @Bean(name = "entityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier("dataSource") DataSource dataSource,
            @Qualifier("masterFlyway") Flyway masterFlyway) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.awais.hr.module");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        properties.put("hibernate.show_sql", "false");
        properties.put("hibernate.format_sql", "false");
        // Prevent hibernate from altering structures directly; we rely on Flyway migrations
        properties.put("hibernate.hbm2ddl.auto", "none");
        em.setJpaPropertyMap(properties);

        return em;
    }

    @Primary
    @Bean(name = "transactionManager")
    public PlatformTransactionManager transactionManager(
            LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        JpaTransactionManager txManager = new JpaTransactionManager();
        txManager.setEntityManagerFactory(entityManagerFactory.getObject());
        return txManager;
    }
}
