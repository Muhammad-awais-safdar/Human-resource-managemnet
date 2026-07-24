package com.awais.hr.module.marketplace.service;

import java.util.List;
import java.util.Map;

public interface MarketplaceService {
    List<Map<String, Object>> getPlugins();
    Map<String, Object> installPlugin(Map<String, Object> body);
}
