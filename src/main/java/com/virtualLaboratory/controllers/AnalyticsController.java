package com.virtualLaboratory.controllers;

import com.virtualLaboratory.dto.analytics.AdminAnalyticsDTO;
import com.virtualLaboratory.dto.analytics.SectionAnalyticsDTO;
import com.virtualLaboratory.dto.analytics.StudentAnalyticsDTO;
import com.virtualLaboratory.dto.analytics.TeacherAnalyticsDTO;
import com.virtualLaboratory.services.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin")
    public ResponseEntity<AdminAnalyticsDTO> getAdminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }

    @GetMapping("/teacher")
    public ResponseEntity<TeacherAnalyticsDTO> getTeacherAnalytics(@RequestParam(required = false) Long sectionId) {
        return ResponseEntity.ok(analyticsService.getTeacherAnalytics(sectionId));
    }

    @GetMapping("/student")
    public ResponseEntity<StudentAnalyticsDTO> getStudentAnalytics() {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics());
    }

    @GetMapping("/sections/{sectionId}")
    public ResponseEntity<SectionAnalyticsDTO> getSectionAnalytics(@PathVariable Long sectionId) {
        return ResponseEntity.ok(analyticsService.getSectionAnalytics(sectionId));
    }
}
