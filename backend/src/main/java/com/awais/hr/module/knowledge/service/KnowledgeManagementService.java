package com.awais.hr.module.knowledge.service;

import java.util.List;
import java.util.Map;

public interface KnowledgeManagementService {
    List<Map<String, Object>> getArticles();
    Map<String, Object> createArticle(Map<String, Object> body);
    List<Map<String, Object>> getSops();
    Map<String, Object> createSop(Map<String, Object> body);
}
