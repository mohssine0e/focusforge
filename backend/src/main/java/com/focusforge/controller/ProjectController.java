package com.focusforge.controller;

import com.focusforge.dto.ApiResponse;
import com.focusforge.dto.ProjectRequest;
import com.focusforge.dto.ProjectResponse;
import com.focusforge.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@PathVariable Long workspaceId, @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Project created successfully"));
    }

    @GetMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjectsByWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectsByWorkspace(workspaceId)));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectById(id)));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(projectService.updateProject(id, request), "Project updated successfully"));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }
}
