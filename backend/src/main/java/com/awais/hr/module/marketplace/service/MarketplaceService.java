package com.awais.hr.module.marketplace.service;

import java.io.File;
import java.util.List;
import java.util.Map;

public interface MarketplaceService {
    List<Map<String, Object>> getPlugins();
    Map<String, Object> installPlugin(Map<String, Object> body);
    Map<String, Object> togglePlugin(String id, boolean enabled);
    Map<String, Object> uninstallPlugin(String id);
    Map<String, Object> uploadAndInstallPluginBundle(File tempFile, String filename);
}
