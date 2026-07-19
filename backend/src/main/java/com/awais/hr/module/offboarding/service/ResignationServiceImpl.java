package com.awais.hr.module.offboarding.service;

import com.awais.hr.module.offboarding.dto.ResignationRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class ResignationServiceImpl implements ResignationService {

    private final DataSource dataSource;

    public ResignationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private boolean isSuperAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        return jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND r.name = 'SUPER_ADMIN')",
                Boolean.class, employeeId
        );
    }

    @Override
    public List<Map<String, Object>> getResignations(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT r.id, r.resignation_date, r.last_working_date, r.reason, r.status, r.deleted, e.first_name, e.last_name " +
                    "FROM resignation r JOIN employee e ON r.employee_id = e.id"
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT r.id, r.resignation_date, r.last_working_date, r.reason, r.status, e.first_name, e.last_name " +
                    "FROM resignation r JOIN employee e ON r.employee_id = e.id WHERE r.deleted = FALSE"
            );
        }
    }

    @Override
    public void submitResignation(String email, ResignationRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        jdbcTemplate.update(
                "INSERT INTO resignation (id, employee_id, resignation_date, last_working_date, reason, status) " +
                "VALUES (?, ?, CURRENT_DATE, CURRENT_DATE + 30, ?, 'PENDING')",
                UUID.randomUUID().toString(), empId, dto.getReason()
        );
    }

    @Override
    public void deleteResignation(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE resignation SET deleted = TRUE WHERE id = ?", id);
    }

    @Override
    public void settleResignation(String id, String exitFeedback, double customSettlement) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        String empId = jdbcTemplate.queryForObject("SELECT employee_id FROM resignation WHERE id = ?", String.class, id);
        
        double settlement = customSettlement;
        if (settlement <= 0) {
            List<Map<String, Object>> salaries = jdbcTemplate.queryForList(
                    "SELECT basic_salary, allowance, deductions FROM salary_structure WHERE employee_id = ?",
                    empId
            );
            if (!salaries.isEmpty()) {
                Map<String, Object> salary = salaries.get(0);
                double basic = ((java.math.BigDecimal) salary.get("basic_salary")).doubleValue();
                double allowance = ((java.math.BigDecimal) salary.get("allowance")).doubleValue();
                double deductions = ((java.math.BigDecimal) salary.get("deductions")).doubleValue();
                settlement = basic + allowance - deductions;
            } else {
                settlement = 3000.00;
            }
        }
        
        jdbcTemplate.update(
                "UPDATE resignation SET exit_interview_feedback = ?, final_settlement_amount = ?, status = 'APPROVED' WHERE id = ?",
                exitFeedback, settlement, id
        );
    }
}
