package com.focusforge.controller;

import com.focusforge.dto.ApiResponse;
import com.focusforge.dto.TaskDependencyResponse;
import com.focusforge.service.TaskDependencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskDependencyController {

    private final TaskDependencyService taskDependencyService;

    public TaskDependencyController(TaskDependencyService taskDependencyService) {
        this.taskDependencyService = taskDependencyService;
    }

    @PostMapping("/{taskId}/dependencies/{dependsOnTaskId}")
    public ResponseEntity<ApiResponse<TaskDependencyResponse>> addDependency(
            @PathVariable Long taskId,
            @PathVariable Long dependsOnTaskId) {
        TaskDependencyResponse dependency = taskDependencyService.addDependency(taskId, dependsOnTaskId);
        return ResponseEntity.ok(ApiResponse.success(dependency, "Task dependency added successfully"));
    }

    @DeleteMapping("/{taskId}/dependencies/{dependsOnTaskId}")
    public ResponseEntity<ApiResponse<Void>> removeDependency(
            @PathVariable Long taskId,
            @PathVariable Long dependsOnTaskId) {
        taskDependencyService.removeDependency(taskId, dependsOnTaskId);
        return ResponseEntity.ok(ApiResponse.success(null, "Task dependency removed successfully"));
    }

    @GetMapping("/{taskId}/dependencies")
    public ResponseEntity<ApiResponse<List<TaskDependencyResponse>>> getDependencies(@PathVariable Long taskId) {
        List<TaskDependencyResponse> dependencies = taskDependencyService.getDependencyResponsesForTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(dependencies));
    }
}
