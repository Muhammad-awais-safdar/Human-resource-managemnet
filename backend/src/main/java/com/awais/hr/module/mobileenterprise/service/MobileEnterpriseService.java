package com.awais.hr.module.mobileenterprise.service;

import java.util.List;
import java.util.Map;

public interface MobileEnterpriseService {
    List<Map<String, Object>> getDevices();
    Map<String, Object> registerDevice(Map<String, Object> body);
}
