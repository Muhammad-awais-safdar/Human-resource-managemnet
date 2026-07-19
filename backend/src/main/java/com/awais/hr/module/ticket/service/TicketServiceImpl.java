package com.awais.hr.module.ticket.service;

import com.awais.hr.module.ticket.dto.SupportTicketRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    private final DataSource dataSource;

    public TicketServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private boolean isSuperAdmin(JdbcTemplate jdbcTemplate, String employeeId) {
        return jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM employee_role er JOIN role r ON er.role_id = r.id WHERE er.employee_id = ? AND r.name = 'SUPER_ADMIN')",
                Boolean.class, employeeId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTickets(String email) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        
        if (isSuperAdmin(jdbcTemplate, empId)) {
            return jdbcTemplate.queryForList(
                    "SELECT st.id, st.subject, st.description, st.status, st.priority, st.assigned_to, st.deleted, " +
                    "e.first_name as author_first, e.last_name as author_last, " +
                    "ae.first_name as assignee_first, ae.last_name as assignee_last " +
                    "FROM support_ticket st " +
                    "JOIN employee e ON st.employee_id = e.id " +
                    "LEFT JOIN employee ae ON st.assigned_to = ae.id " +
                    "ORDER BY st.id"
            );
        } else {
            return jdbcTemplate.queryForList(
                    "SELECT st.id, st.subject, st.description, st.status, st.priority, st.assigned_to " +
                    "FROM support_ticket st " +
                    "WHERE st.employee_id = ? AND st.deleted = FALSE " +
                    "ORDER BY st.id",
                    empId
            );
        }
    }

    @Override
    public void submitTicket(String email, SupportTicketRequestDTO dto) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String empId = jdbcTemplate.queryForObject("SELECT id FROM employee WHERE email = ?", String.class, email);
        String priority = dto.getPriority() != null ? dto.getPriority().toUpperCase().trim() : "MEDIUM";

        // Auto-assignment engine: find Admin/Super-Admin with minimum active tickets
        List<String> adminList = jdbcTemplate.queryForList(
                "SELECT DISTINCT er.employee_id FROM employee_role er JOIN role r ON er.role_id = r.id WHERE r.name = 'SUPER_ADMIN' OR r.name = 'ADMIN'",
                String.class
        );
        String bestAssigneeId = null;
        if (!adminList.isEmpty()) {
            int minTickets = Integer.MAX_VALUE;
            for (String adminId : adminList) {
                Integer count = jdbcTemplate.queryForObject(
                        "SELECT COUNT(1) FROM support_ticket WHERE assigned_to = ? AND status = 'OPEN'",
                        Integer.class, adminId
                );
                if (count != null && count < minTickets) {
                    minTickets = count;
                    bestAssigneeId = adminId;
                }
            }
        }

        jdbcTemplate.update("INSERT INTO support_ticket (id, employee_id, subject, description, status, priority, assigned_to) VALUES (?, ?, ?, ?, 'OPEN', ?, ?)",
                UUID.randomUUID().toString(), empId, dto.getSubject(), dto.getDescription(), priority, bestAssigneeId);
    }

    @Override
    public void deleteTicket(String id) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE support_ticket SET deleted = TRUE WHERE id = ?", id);
    }

    @Override
    public void assignTicket(String ticketId, String assigneeId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE support_ticket SET assigned_to = ? WHERE id = ?", assigneeId, ticketId);
    }

    @Override
    public void resolveTicket(String ticketId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update("UPDATE support_ticket SET status = 'RESOLVED' WHERE id = ?", ticketId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchKnowledgeBase(String query) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String searchPattern = "%" + (query != null ? query.toLowerCase().trim() : "") + "%";
        return jdbcTemplate.queryForList(
                "SELECT id, title, content, category FROM knowledge_base_article WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(category) LIKE ?",
                searchPattern, searchPattern, searchPattern
        );
    }

    @Override
    public void createKnowledgeBaseArticle(String title, String content, String category) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.update(
                "INSERT INTO knowledge_base_article (id, title, content, category) VALUES (?, ?, ?, ?)",
                UUID.randomUUID().toString(), title, content, category
        );
    }
}
