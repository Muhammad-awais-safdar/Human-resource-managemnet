package com.awais.hr.module.migration.service;

import java.util.List;
import java.util.Map;

public interface DataMigrationService {
    List<Map<String, Object>> getMigrationJobs();
    Map<String, Object> executeMigrationJob(Map<String, Object> body);
}
