package com.awais.hr.module.aicopilot.service;

import java.util.List;
import java.util.Map;

public interface AiCopilotService {
    List<Map<String, Object>> getSessions();
    Map<String, Object> askCopilot(Map<String, Object> body);
}
