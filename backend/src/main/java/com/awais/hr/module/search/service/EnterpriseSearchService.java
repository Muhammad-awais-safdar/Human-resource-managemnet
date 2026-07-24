package com.awais.hr.module.search.service;

import java.util.List;
import java.util.Map;

public interface EnterpriseSearchService {
    List<Map<String, Object>> search(String query);
    Map<String, Object> indexEntity(Map<String, Object> body);
}
