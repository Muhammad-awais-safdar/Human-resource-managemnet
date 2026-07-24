package com.awais.hr.module.localization.service;

import java.util.Map;

public interface LocalizationService {
    Map<String, Object> getLocaleSettings();
    Map<String, Object> updateLocaleSettings(Map<String, Object> body);
}
