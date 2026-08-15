package com.awais.hr.module.it.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.config.HasPermission;
import com.awais.hr.config.RequiresModule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/integrations/dev-timesheet")
public class DevTimesheetController {

    private final List<Map<String, Object>> worklogLedger = new ArrayList<>();

    @PostMapping("/jira/webhook")
    @RequiresModule("DEV_TIMESHEET")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ingestJiraWorklog(@RequestBody Map<String, Object> payload) {
        String issueKey = (String) payload.getOrDefault("issueKey", "ENG-101");
        String developerEmail = (String) payload.getOrDefault("developerEmail", "dev@company.com");
        Double hoursLogged = Double.valueOf(payload.getOrDefault("hoursLogged", 4.5).toString());
        String description = (String) payload.getOrDefault("description", "Implemented REST API endpoint");

        Map<String, Object> entry = new HashMap<>();
        entry.put("id", UUID.randomUUID().toString());
        entry.put("source", "JIRA_WEBHOOK");
        entry.put("issueKey", issueKey);
        entry.put("developerEmail", developerEmail);
        entry.put("hoursLogged", hoursLogged);
        entry.put("description", description);
        entry.put("ingestedAt", LocalDateTime.now().toString());

        worklogLedger.add(entry);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Jira worklog ingested and converted into billable project timesheet",
            "entry", entry
        )));
    }

    @PostMapping("/git/commit")
    @RequiresModule("DEV_TIMESHEET")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ingestGitCommit(@RequestBody Map<String, Object> payload) {
        String commitHash = (String) payload.getOrDefault("commitHash", "a1b2c3d4");
        String authorEmail = (String) payload.getOrDefault("authorEmail", "dev@company.com");
        String repository = (String) payload.getOrDefault("repository", "backend-service");
        String message = (String) payload.getOrDefault("message", "fix: resolved database deadlock");

        Map<String, Object> entry = new HashMap<>();
        entry.put("id", UUID.randomUUID().toString());
        entry.put("source", "GIT_COMMIT_HOOK");
        entry.put("commitHash", commitHash);
        entry.put("authorEmail", authorEmail);
        entry.put("repository", repository);
        entry.put("message", message);
        entry.put("ingestedAt", LocalDateTime.now().toString());

        worklogLedger.add(entry);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Git commit activity recorded into developer timesheet audit log",
            "entry", entry
        )));
    }

    @GetMapping("/worklogs")
    @HasPermission("corehr:employee:read")
    @RequiresModule("DEV_TIMESHEET")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWorklogs() {
        return ResponseEntity.ok(ApiResponse.success(worklogLedger));
    }
}
