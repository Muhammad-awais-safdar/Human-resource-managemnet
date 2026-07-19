package com.awais.hr.module.mobile.service;

import java.util.List;
import java.util.Map;

public interface MobileSyncService {
    void registerDevice(String email, String deviceToken, String platform, String clientVersion);
    Map<String, Object> syncDelta(String deviceToken, String email);
    void pushDelta(String deviceToken, String syncDeltaJson);
    List<Map<String, Object>> getDevicesForEmployee(String email);
    void deregisterDevice(String deviceToken);
}
