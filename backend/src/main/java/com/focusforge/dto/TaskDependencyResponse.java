package com.focusforge.dto;

import com.focusforge.entity.TaskDependency;
import com.focusforge.entity.TaskStatus;

import java.time.LocalDateTime;

public class TaskDependencyResponse {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long dependsOnTaskId;
    private String dependsOnTaskTitle;
    private TaskStatus dependsOnTaskStatus;
    private LocalDateTime createdAt;

    public TaskDependencyResponse() {
    }

    public TaskDependencyResponse(Long id, Long taskId, String taskTitle, Long dependsOnTaskId,
                                  String dependsOnTaskTitle, TaskStatus dependsOnTaskStatus,
                                  LocalDateTime createdAt) {
        this.id = id;
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.dependsOnTaskId = dependsOnTaskId;
        this.dependsOnTaskTitle = dependsOnTaskTitle;
        this.dependsOnTaskStatus = dependsOnTaskStatus;
        this.createdAt = createdAt;
    }

    public static TaskDependencyResponse from(TaskDependency dependency) {
        return new TaskDependencyResponse(
                dependency.getId(),
                dependency.getTask().getId(),
                dependency.getTask().getTitle(),
                dependency.getDependsOnTask().getId(),
                dependency.getDependsOnTask().getTitle(),
                dependency.getDependsOnTask().getStatus(),
                dependency.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public Long getDependsOnTaskId() {
        return dependsOnTaskId;
    }

    public void setDependsOnTaskId(Long dependsOnTaskId) {
        this.dependsOnTaskId = dependsOnTaskId;
    }

    public String getDependsOnTaskTitle() {
        return dependsOnTaskTitle;
    }

    public void setDependsOnTaskTitle(String dependsOnTaskTitle) {
        this.dependsOnTaskTitle = dependsOnTaskTitle;
    }

    public TaskStatus getDependsOnTaskStatus() {
        return dependsOnTaskStatus;
    }

    public void setDependsOnTaskStatus(TaskStatus dependsOnTaskStatus) {
        this.dependsOnTaskStatus = dependsOnTaskStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
