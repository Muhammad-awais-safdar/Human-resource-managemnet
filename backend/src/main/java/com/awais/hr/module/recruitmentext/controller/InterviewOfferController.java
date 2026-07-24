package com.awais.hr.module.recruitmentext.controller;

import com.awais.hr.config.HasPermission;
import com.awais.hr.module.recruitmentext.service.InterviewOfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suite/recruitment-ext")
public class InterviewOfferController {

    private final InterviewOfferService interviewOfferService;

    public InterviewOfferController(InterviewOfferService interviewOfferService) {
        this.interviewOfferService = interviewOfferService;
    }

    @GetMapping("/interviews")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getInterviews() {
        return ResponseEntity.ok(interviewOfferService.getInterviews());
    }

    @PostMapping("/interviews")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> scheduleInterview(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(interviewOfferService.scheduleInterview(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/offers")
    @HasPermission("corehr:employee:read")
    public ResponseEntity<List<Map<String, Object>>> getOffers() {
        return ResponseEntity.ok(interviewOfferService.getOffers());
    }

    @PostMapping("/offers")
    @HasPermission("corehr:employee:write")
    public ResponseEntity<?> createOffer(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(interviewOfferService.createOffer(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
