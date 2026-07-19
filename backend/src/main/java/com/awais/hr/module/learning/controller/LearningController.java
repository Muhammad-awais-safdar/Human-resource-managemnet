package com.awais.hr.module.learning.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.learning.service.LearningService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/learning")
@CrossOrigin(origins = "*")
public class LearningController {

    private final LearningService learningService;

    public LearningController(LearningService learningService) {
        this.learningService = learningService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping("/courses")
    public ApiResponse<List<Map<String, Object>>> getCourses() {
        try {
            return ApiResponse.success(learningService.getCourses(getAuthenticatedUserEmail()));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/courses/all")
    public ApiResponse<List<Map<String, Object>>> getAllCourses() {
        try {
            return ApiResponse.success(learningService.getAllCourses());
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/courses/{courseId}/enroll")
    public ApiResponse<Map<String, Object>> enrollCourse(@PathVariable String courseId) {
        try {
            learningService.enrollCourse(getAuthenticatedUserEmail(), courseId);
            return ApiResponse.success(Map.of("success", true, "message", "Enrolled in course successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/courses/{courseId}/quizzes")
    public ApiResponse<List<Map<String, Object>>> getCourseQuizzes(@PathVariable String courseId) {
        try {
            return ApiResponse.success(learningService.getCourseQuizzes(courseId));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/quizzes/{quizId}/answer")
    public ApiResponse<Map<String, Object>> submitQuizAnswer(
            @PathVariable String quizId, @RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = learningService.submitQuizAnswer(quizId, body.get("answer"));
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}

