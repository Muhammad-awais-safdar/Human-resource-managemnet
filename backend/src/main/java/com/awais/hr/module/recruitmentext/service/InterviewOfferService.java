package com.awais.hr.module.recruitmentext.service;

import java.util.List;
import java.util.Map;

public interface InterviewOfferService {
    List<Map<String, Object>> getInterviews();
    Map<String, Object> scheduleInterview(Map<String, Object> body);
    List<Map<String, Object>> getOffers();
    Map<String, Object> createOffer(Map<String, Object> body);
}
