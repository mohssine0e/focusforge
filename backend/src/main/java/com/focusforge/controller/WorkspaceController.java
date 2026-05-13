package com.focusforge.controller;

import com.focusforge.dto.ApiResponse;
import com.focusforge.dto.WorkspaceRequest;
import com.focusforge.dto.WorkspaceResponse;
import com.focusforge.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @Autowired
    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(@Valid @RequestBody WorkspaceRequest request) {
        WorkspaceResponse response = workspaceService.createWorkspace(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Workspace created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getAllWorkspaces() {
        return ResponseEntity.ok(ApiResponse.success(workspaceService.getAllWorkspaces()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspace(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(workspaceService.getWorkspaceById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(@PathVariable Long id, @Valid @RequestBody WorkspaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(workspaceService.updateWorkspace(id, request), "Workspace updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(@PathVariable Long id) {
        workspaceService.deleteWorkspace(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Workspace deleted successfully"));
    }
}