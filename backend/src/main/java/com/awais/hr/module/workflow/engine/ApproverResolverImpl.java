package com.awais.hr.module.workflow.engine;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.List;

@Component
public class ApproverResolverImpl implements ApproverResolver {

    private static final Logger log = LoggerFactory.getLogger(ApproverResolverImpl.class);
    private final DataSource dataSource;

    public ApproverResolverImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<String> resolveApprovers(String approverType, String targetApproverId, String initiatorEmpId, String resourceOwnerEmpId) {
        if (approverType == null) {
            return List.of();
        }

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String typeUpper = approverType.toUpperCase().trim();

        switch (typeUpper) {
            case "USER":
                return targetApproverId != null ? List.of(targetApproverId) : List.of();

            case "RESOURCE_OWNER":
                return resourceOwnerEmpId != null ? List.of(resourceOwnerEmpId) : List.of();

            case "MANAGER":
                if (initiatorEmpId == null) return List.of();
                String managerSql = "SELECT o.manager_id FROM employee e " +
                        "JOIN org_unit o ON e.org_unit_id = o.id " +
                        "WHERE e.id = ? AND o.manager_id IS NOT NULL";
                List<String> managers = jdbc.queryForList(managerSql, String.class, initiatorEmpId);
                return managers;

            case "DEPARTMENT_HEAD":
                if (initiatorEmpId == null) return List.of();
                String deptHeadSql = "SELECT o.manager_id FROM employee e " +
                        "JOIN org_unit o ON e.org_unit_id = o.id " +
                        "WHERE e.id = ? AND o.type IN ('DEPARTMENT', 'LEGAL_ENTITY') AND o.manager_id IS NOT NULL";
                List<String> deptHeads = jdbc.queryForList(deptHeadSql, String.class, initiatorEmpId);
                return deptHeads;

            case "ROLE":
                if (targetApproverId == null) return List.of();
                String roleSql = "SELECT er.employee_id FROM employee_role er " +
                        "JOIN role r ON er.role_id = r.id " +
                        "WHERE (r.name = ? OR r.id = ?)";
                return jdbc.queryForList(roleSql, String.class, targetApproverId, targetApproverId);

            case "HR":
                String hrSql = "SELECT er.employee_id FROM employee_role er " +
                        "JOIN role r ON er.role_id = r.id " +
                        "WHERE r.name IN ('HR_MANAGER', 'TENANT_ADMIN', 'SYSTEM_ADMIN')";
                return jdbc.queryForList(hrSql, String.class);

            case "FINANCE":
            case "CFO":
                String finSql = "SELECT er.employee_id FROM employee_role er " +
                        "JOIN role r ON er.role_id = r.id " +
                        "WHERE r.name IN ('FINANCE_ADMIN', 'TENANT_ADMIN', 'SYSTEM_ADMIN')";
                return jdbc.queryForList(finSql, String.class);

            default:
                log.warn("Unknown approver type: {}", approverType);
                return List.of();
        }
    }
}
