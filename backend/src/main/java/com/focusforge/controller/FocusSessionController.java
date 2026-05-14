package com.focusforge.controller;

import com.focusforge.dto.ApiResponse;
import com.focusforge.dto.FocusSessionResponse;
import com.focusforge.entity.FocusSessionType;
import com.focusforge.service.FocusSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FocusSessionController {

    private final FocusSessionService focusSessionService;

    public FocusSessionController(FocusSessionService focusSessionService) {
        this.focusSessionService = focusSessionService;
    }

    @PostMapping("/tasks/{taskId}/focus/start")
    public ResponseEntity<ApiResponse<FocusSessionResponse>> startSession(
            @PathVariable Long taskId,
            @RequestParam(required = false) FocusSessionType sessionType) {
        FocusSessionResponse session = focusSessionService.startSession(taskId, sessionType);
        return ResponseEntity.ok(ApiResponse.success(session, "Focus session started"));
    }

    @PatchMapping("/focus-sessions/{id}/finish")
    public ResponseEntity<ApiResponse<FocusSessionResponse>> finishSession(@PathVariable Long id) {
        FocusSessionResponse session = focusSessionService.finishSession(id);
        return ResponseEntity.ok(ApiResponse.success(session, "Focus session finished"));
    }

    @PatchMapping("/focus-sessions/{id}/cancel")
    public ResponseEntity<ApiResponse<FocusSessionResponse>> cancelSession(@PathVariable Long id) {
        FocusSessionResponse session = focusSessionService.cancelSession(id);
        return ResponseEntity.ok(ApiResponse.success(session, "Focus session cancelled"));
    }

    @GetMapping("/tasks/{taskId}/focus-sessions")
    public ResponseEntity<ApiResponse<List<FocusSessionResponse>>> getSessionsByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(focusSessionService.getSessionsByTask(taskId)));
    }

    @GetMapping("/focus-sessions")
    public ResponseEntity<ApiResponse<List<FocusSessionResponse>>> getAllSessions() {
        return ResponseEntity.ok(ApiResponse.success(focusSessionService.getAllSessions()));
    }

    @GetMapping("/focus-sessions/active")
    public ResponseEntity<ApiResponse<FocusSessionResponse>> getActiveSession() {
        return ResponseEntity.ok(ApiResponse.success(focusSessionService.getActiveSession()));
    }
}
