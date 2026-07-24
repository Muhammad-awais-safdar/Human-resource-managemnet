package com.awais.hr.module.salarystructure.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class SalaryStructureServiceImpl implements SalaryStructureService {

    private static final Logger log = LoggerFactory.getLogger(SalaryStructureServiceImpl.class);
    private final DataSource dataSource;

    public SalaryStructureServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getComponents() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = jdbc.queryForList("SELECT id, component_name, component_type, calculation_type, default_amount, is_taxable, created_at FROM salary_component ORDER BY created_at DESC");
        if (list.isEmpty()) {
            return List.of(
                    Map.of("componentName", "Basic Salary", "componentType", "EARNING", "calculationType", "FIXED", "defaultAmount", 3000.00, "isTaxable", true),
                    Map.of("componentName", "House Rent Allowance (HRA)", "componentType", "EARNING", "calculationType", "PERCENTAGE", "defaultAmount", 1200.00, "isTaxable", true)
            );
        }
        return list;
    }

    @Override
    public Map<String, Object> createComponent(Map<String, Object> body) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String name = (String) body.get("componentName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Component name is required.");
        }
        String type = body.get("componentType") != null ? (String) body.get("componentType") : "EARNING";
        String calcType = body.get("calculationType") != null ? (String) body.get("calculationType") : "FIXED";
        BigDecimal amt = body.get("defaultAmount") != null ? BigDecimal.valueOf(((Number) body.get("defaultAmount")).doubleValue()) : BigDecimal.ZERO;
        Boolean taxable = body.get("isTaxable") != null ? (Boolean) body.get("isTaxable") : true;

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO salary_component (id, component_name, component_type, calculation_type, default_amount, is_taxable) VALUES (?, ?, ?, ?, ?, ?)", id, name.trim(), type, calcType, amt, taxable);
        log.info("Salary component created: name={} type={}", name, type);
        return Map.of("id", id, "componentName", name, "componentType", type, "calculationType", calcType, "defaultAmount", amt, "isTaxable", taxable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTemplates() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, template_name, pay_grade, base_salary, updated_at FROM salary_structure_template ORDER BY updated_at DESC");
    }
}
