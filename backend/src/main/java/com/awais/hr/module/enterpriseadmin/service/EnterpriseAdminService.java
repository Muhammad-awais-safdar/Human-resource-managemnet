package com.awais.hr.module.enterpriseadmin.service;

import java.util.Map;

public interface EnterpriseAdminService {
    Map<String, Object> getAdminSettings();
    Map<String, Object> updateAdminSettings(Map<String, Object> body);
}
