package com.focusforge.controller;

import com.focusforge.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ApiResponse<String> healthCheck() {
        return ApiResponse.success("FocusForge backend is running!", "Health check successful");
    }
}