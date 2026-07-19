package com.awais.hr.module.settings.service;

import java.util.Map;

public interface PlatformSettingsService {
    Map<String, Object> getSettings();
    void updateSettings(Map<String, String> settings);
}
