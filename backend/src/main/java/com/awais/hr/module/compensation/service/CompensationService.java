package com.awais.hr.module.compensation.service;

import java.util.List;
import java.util.Map;

public interface CompensationService {
    List<Map<String, Object>> getBands();
    void addBand(Map<String, Object> body);
    List<Map<String, Object>> getSalaryReviews();
    void submitReview(String requesterEmail, Map<String, Object> body);
    void actionReview(String reviewerEmail, String reviewId, String status);
}
