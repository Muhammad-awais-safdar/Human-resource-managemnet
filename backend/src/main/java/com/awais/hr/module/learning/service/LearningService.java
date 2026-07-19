package com.awais.hr.module.learning.service;

import java.util.List;
import java.util.Map;

public interface LearningService {
    List<Map<String, Object>> getCourses(String email);
    List<Map<String, Object>> getAllCourses();
    void enrollCourse(String email, String courseId);
    List<Map<String, Object>> getCourseQuizzes(String courseId);
    Map<String, Object> submitQuizAnswer(String quizId, String answer);
}
