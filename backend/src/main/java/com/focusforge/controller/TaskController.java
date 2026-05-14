package com.focusforge.controller;

import com.focusforge.dto.ApiResponse;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import com.focusforge.entity.TaskType;
import com.focusforge.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String sort) {
        List<Task> tasks = taskService.getTasksByProject(projectId, sort);
        ApiResponse<List<Task>> response = ApiResponse.success(tasks);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<Task>> createTask(
            @PathVariable Long projectId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam TaskType type) {
        Task task = taskService.createTask(projectId, title, description, type);
        ApiResponse<Task> response = ApiResponse.success(task, "Task created successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Task>> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(task -> ResponseEntity.ok(ApiResponse.success(task)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam TaskType type) {
        Task task = taskService.updateTask(id, title, description, type);
        ApiResponse<Task> response = ApiResponse.success(task, "Task updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Task deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<Task>> updateTaskStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        Task task = taskService.updateTaskStatus(id, status);
        ApiResponse<Task> response = ApiResponse.success(task, "Task status updated successfully");
        return ResponseEntity.ok(response);
    }
}
