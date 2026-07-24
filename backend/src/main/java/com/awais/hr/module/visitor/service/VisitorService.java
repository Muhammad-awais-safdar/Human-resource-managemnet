package com.awais.hr.module.visitor.service;

import java.util.List;
import java.util.Map;

public interface VisitorService {
    List<Map<String, Object>> getVisitors();
    Map<String, Object> registerVisitor(Map<String, Object> body);
    Map<String, Object> checkInVisitor(String visitorId);
    Map<String, Object> checkOutVisitor(String visitorId);
    Map<String, Object> updateVisitorStatus(String visitorId, String status);
}
