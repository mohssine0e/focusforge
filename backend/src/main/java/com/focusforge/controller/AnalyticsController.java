package com.focusforge.controller;

import com.focusforge.dto.AnalyticsOverviewResponse;
import com.focusforge.dto.ApiResponse;
import com.focusforge.dto.ProjectAnalyticsResponse;
import com.focusforge.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverview()));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectAnalyticsResponse>> getProjectAnalytics(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getProjectAnalytics(projectId)));
    }
}
