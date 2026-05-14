package com.focusforge.dto;

import com.focusforge.decorator.TaskDisplayMetadata;
import com.focusforge.entity.Priority;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import com.focusforge.entity.TaskType;

import java.time.LocalDateTime;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private TaskType type;
    private LocalDateTime dueDate;
    private Integer estimatedMinutes;
    private Long projectId;
    private String projectName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String priorityLabel;
    private boolean overdue;
    private boolean dueSoon;
    private boolean dependencyWarning;
    private String blockedReason;

    public TaskResponse() {
    }

    public static TaskResponse from(Task task, TaskDisplayMetadata metadata) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setType(task.getType());
        response.setDueDate(task.getDueDate());
        response.setEstimatedMinutes(task.getEstimatedMinutes());
        response.setProjectId(task.getProject() == null ? null : task.getProject().getId());
        response.setProjectName(task.getProject() == null ? null : task.getProject().getName());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setPriorityLabel(metadata.getPriorityLabel());
        response.setOverdue(metadata.isOverdue());
        response.setDueSoon(metadata.isDueSoon());
        response.setDependencyWarning(metadata.isDependencyWarning());
        response.setBlockedReason(metadata.getBlockedReason());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPriorityLabel() {
        return priorityLabel;
    }

    public void setPriorityLabel(String priorityLabel) {
        this.priorityLabel = priorityLabel;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public boolean isDueSoon() {
        return dueSoon;
    }

    public void setDueSoon(boolean dueSoon) {
        this.dueSoon = dueSoon;
    }

    public boolean isDependencyWarning() {
        return dependencyWarning;
    }

    public void setDependencyWarning(boolean dependencyWarning) {
        this.dependencyWarning = dependencyWarning;
    }

    public String getBlockedReason() {
        return blockedReason;
    }

    public void setBlockedReason(String blockedReason) {
        this.blockedReason = blockedReason;
    }
}
