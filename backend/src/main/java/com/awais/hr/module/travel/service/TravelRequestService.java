package com.awais.hr.module.travel.service;

import java.util.List;
import java.util.Map;

public interface TravelRequestService {
    List<Map<String, Object>> getTravelRequests(String email);
    void submitTravelRequest(String email, String destination, String purpose, String startDate, String endDate);
    void approveTravelRequest(String id, String email);
    void rejectTravelRequest(String id, String email);
}
