package com.awais.hr.module.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@Transactional
public class AiAutomationServiceImpl implements AiAutomationService {

    private static final Logger log = LoggerFactory.getLogger(AiAutomationServiceImpl.class);
    private final DataSource dataSource;

    public AiAutomationServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAnomalies() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.queryForList("SELECT id, entity_type, entity_id, severity, reason, detected_at, resolved FROM ai_anomaly_flag ORDER BY detected_at DESC");
    }

    @Override
    public void runAnomalyDetection() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        // 1. Expense Claims: Amount > 5000 is HIGH severity, Amount > 3000 is MEDIUM severity
        List<Map<String, Object>> claims = jdbc.queryForList(
                "SELECT id, amount, employee_id FROM expense_claim WHERE status = 'PENDING' AND id NOT IN (SELECT entity_id FROM ai_anomaly_flag WHERE entity_type = 'EXPENSE')"
        );
        for (Map<String, Object> c : claims) {
            String claimId = (String) c.get("id");
            Number amount = (Number) c.get("amount");
            if (amount != null) {
                double val = amount.doubleValue();
                if (val > 5000.0) {
                    insertAnomaly(claimId, "EXPENSE", "HIGH", "Expense claim amount $" + val + " exceeds dynamic limit of $5000.");
                } else if (val > 3000.0) {
                    insertAnomaly(claimId, "EXPENSE", "MEDIUM", "Expense claim amount $" + val + " exceeds standard review threshold of $3000.");
                }
            }
        }

        // 2. Timesheets: Hours worked > 12 in a single day is HIGH, Hours worked > 10 is MEDIUM
        List<Map<String, Object>> timesheets = jdbc.queryForList(
                "SELECT id, hours_worked, work_date FROM timesheet_log WHERE status = 'PENDING' AND id NOT IN (SELECT entity_id FROM ai_anomaly_flag WHERE entity_type = 'TIMESHEET')"
        );
        for (Map<String, Object> t : timesheets) {
            String logId = (String) t.get("id");
            Number hours = (Number) t.get("hours_worked");
            if (hours != null) {
                double val = hours.doubleValue();
                if (val > 12.0) {
                    insertAnomaly(logId, "TIMESHEET", "HIGH", "Timesheet hours " + val + " exceeds single-day compliance limit of 12 hours.");
                } else if (val > 10.0) {
                    insertAnomaly(logId, "TIMESHEET", "MEDIUM", "Timesheet hours " + val + " is above threshold.");
                }
            }
        }

        // 3. Attendance geofence checks: Coordinates far from standard office latitude/longitude (e.g. NYC 40.7128, -74.0060)
        List<Map<String, Object>> attendance = jdbc.queryForList(
                "SELECT id, latitude, longitude, employee_id FROM attendance_record WHERE id NOT IN (SELECT entity_id FROM ai_anomaly_flag WHERE entity_type = 'ATTENDANCE')"
        );
        double officeLat = 40.7128;
        double officeLng = -74.0060;
        for (Map<String, Object> a : attendance) {
            String recordId = (String) a.get("id");
            Number latNum = (Number) a.get("latitude");
            Number lngNum = (Number) a.get("longitude");
            if (latNum != null && lngNum != null) {
                double lat = latNum.doubleValue();
                double lng = lngNum.doubleValue();
                if (lat != 0.0 && lng != 0.0) {
                    double dist = Math.sqrt(Math.pow(lat - officeLat, 2) + Math.pow(lng - officeLng, 2));
                    if (dist > 0.5) { // Roughly > 50km
                        insertAnomaly(recordId, "ATTENDANCE", "HIGH", "Punch-in location coordinates (" + lat + ", " + lng + ") are too far from registered geofence.");
                    }
                }
            }
        }
    }

    private void insertAnomaly(String entityId, String type, String severity, String reason) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        String id = UUID.randomUUID().toString();
        jdbc.update(
                "INSERT INTO ai_anomaly_flag (id, entity_type, entity_id, severity, reason) VALUES (?, ?, ?, ?, ?)",
                id, type, entityId, severity, reason
        );
        log.info("Anomaly flagged: id={} type={} severity={} reason={}", id, type, severity, reason);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> evaluateCandidateFit(String candidateId) {
        if (candidateId == null || candidateId.isBlank()) {
            throw new IllegalArgumentException("Candidate ID is required.");
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        List<Map<String, Object>> apps = jdbc.queryForList(
                "SELECT c.id, c.extracted_skills, c.extracted_experience, j.title as job_title, j.description as job_desc " +
                "FROM candidate_application c JOIN job_requisition j ON c.job_id = j.id WHERE c.id = ?",
                candidateId
        );

        if (apps.isEmpty()) {
            throw new IllegalArgumentException("Candidate application not found: " + candidateId);
        }

        Map<String, Object> app = apps.get(0);
        String candidateSkills = (String) app.get("extracted_skills");
        String candidateExp = (String) app.get("extracted_experience");
        String jobTitle = (String) app.get("job_title");
        String jobDesc = (String) app.get("job_desc");

        // Parse candidate experience years
        int candYears = 0;
        if (candidateExp != null) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(candidateExp);
            if (m.find()) {
                candYears = Integer.parseInt(m.group(1));
            }
        }

        // Count skill matches
        int matchCount = 0;
        int totalKeywords = 0;
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        String[] keywords = {"Java", "Spring Boot", "React", "SQL", "Python", "TypeScript", "Docker", "Kubernetes", "AWS", "CSS", "HTML"};
        for (String kw : keywords) {
            boolean reqInJob = false;
            if (jobTitle != null && jobTitle.toLowerCase().contains(kw.toLowerCase())) reqInJob = true;
            if (jobDesc != null && jobDesc.toLowerCase().contains(kw.toLowerCase())) reqInJob = true;

            if (reqInJob) {
                totalKeywords++;
                if (candidateSkills != null && candidateSkills.toLowerCase().contains(kw.toLowerCase())) {
                    matchCount++;
                    matchedSkills.add(kw);
                } else {
                    missingSkills.add(kw);
                }
            }
        }

        double score = (totalKeywords > 0) ? ((double) matchCount / totalKeywords) * 100 : 75.0; // default baseline

        Map<String, Object> result = new HashMap<>();
        result.put("candidateId", candidateId);
        result.put("jobTitle", jobTitle);
        result.put("matchScore", Math.round(score * 10.0) / 10.0);
        result.put("matchedSkills", matchedSkills);
        result.put("missingSkills", missingSkills);
        result.put("experienceYears", candYears);
        result.put("fitLevel", score >= 80.0 ? "EXCELLENT" : (score >= 50.0 ? "GOOD" : "POOR"));

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> predictAttritionRisk(String employeeId) {
        if (employeeId == null || employeeId.isBlank()) {
            throw new IllegalArgumentException("Employee ID is required.");
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        List<Map<String, Object>> emps = jdbc.queryForList(
                "SELECT id, first_name, last_name, joining_date FROM employee WHERE id = ?",
                employeeId
        );
        if (emps.isEmpty()) {
            throw new IllegalArgumentException("Employee not found: " + employeeId);
        }

        Map<String, Object> emp = emps.get(0);

        // Risk factors evaluation
        List<String> factors = new ArrayList<>();
        int baseRisk = 15; // standard low baseline risk

        // 1. Check average performance reviews
        Double avgRating = jdbc.queryForObject(
                "SELECT COALESCE(AVG(rating), 0.0) FROM peer_feedback WHERE employee_id = ?",
                Double.class, employeeId
        );
        if (avgRating != null && avgRating > 0.0) {
            if (avgRating < 3.0) {
                baseRisk += 35;
                factors.add("Low performance peer feedback score (" + String.format("%.2f", avgRating) + "/5)");
            } else if (avgRating < 4.0) {
                baseRisk += 10;
            }
        }

        // 2. Check pending resignations
        boolean hasPendingResign = Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM resignation WHERE employee_id = ? AND status = 'PENDING')",
                Boolean.class, employeeId
        ));
        if (hasPendingResign) {
            baseRisk = 100;
            factors.add("Formal resignation notice filed and pending.");
        }

        // 3. Short tenure (less than 1 year) has slightly higher risk
        java.sql.Date joinDate = (java.sql.Date) emp.get("joining_date");
        if (joinDate != null) {
            long tenureDays = (System.currentTimeMillis() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
            if (tenureDays < 365) {
                baseRisk += 15;
                factors.add("Tenure is under 1 year (" + tenureDays + " days)");
            }
        }

        baseRisk = Math.min(baseRisk, 100);

        Map<String, Object> result = new HashMap<>();
        result.put("employeeId", employeeId);
        result.put("fullName", emp.get("first_name") + " " + emp.get("last_name"));
        result.put("attritionScore", baseRisk);
        result.put("riskLevel", baseRisk >= 75 ? "HIGH" : (baseRisk >= 40 ? "MEDIUM" : "LOW"));
        result.put("riskFactors", factors);
        return result;
    }
}
