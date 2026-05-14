package com.focusforge.controller;

import com.focusforge.decorator.TaskResponseDecorator;
import com.focusforge.dto.ApiResponse;
import com.focusforge.dto.TaskResponse;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import com.focusforge.entity.TaskType;
import com.focusforge.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;
    private final TaskResponseDecorator taskResponseDecorator;

    @Autowired
    public TaskController(TaskService taskService, TaskResponseDecorator taskResponseDecorator) {
        this.taskService = taskService;
        this.taskResponseDecorator = taskResponseDecorator;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String sort) {
        List<Task> tasks = taskService.getTasksByProject(projectId, sort);
        ApiResponse<List<TaskResponse>> response = ApiResponse.success(taskResponseDecorator.decorateAll(tasks));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}/tasks/recommended")
    public ResponseEntity<ApiResponse<TaskResponse>> getRecommendedTask(
            @PathVariable Long projectId,
            @RequestParam(required = false) String strategy) {
        Task task = taskService.getRecommendedTask(projectId, strategy).orElse(null);
        ApiResponse<TaskResponse> response = ApiResponse.success(task == null ? null : taskResponseDecorator.decorate(task));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable Long projectId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam TaskType type) {
        Task task = taskService.createTask(projectId, title, description, type);
        ApiResponse<TaskResponse> response = ApiResponse.success(taskResponseDecorator.decorate(task), "Task created successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks/due")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getDueTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long projectId) {
        List<Task> tasks = taskService.getDueTasks(from, to, workspaceId, projectId);
        ApiResponse<List<TaskResponse>> response = ApiResponse.success(taskResponseDecorator.decorateAll(tasks));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(task -> ResponseEntity.ok(ApiResponse.success(taskResponseDecorator.decorate(task))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam TaskType type) {
        Task task = taskService.updateTask(id, title, description, type);
        ApiResponse<TaskResponse> response = ApiResponse.success(taskResponseDecorator.decorate(task), "Task updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Task deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        Task task = taskService.updateTaskStatus(id, status);
        ApiResponse<TaskResponse> response = ApiResponse.success(taskResponseDecorator.decorate(task), "Task status updated successfully");
        return ResponseEntity.ok(response);
    }
}
