package com.awais.hr.module.apimarketplace.service;

import java.util.List;
import java.util.Map;

public interface ApiMarketplaceService {
    List<Map<String, Object>> getApiKeys();
    Map<String, Object> generateApiKey(Map<String, Object> body);
}
