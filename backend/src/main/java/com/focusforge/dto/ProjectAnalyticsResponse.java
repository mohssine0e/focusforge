package com.focusforge.dto;

import com.focusforge.entity.Priority;
import com.focusforge.entity.TaskStatus;

import java.util.Map;

public class ProjectAnalyticsResponse {

    private Long projectId;
    private String projectName;
    private long totalTasks;
    private Map<TaskStatus, Long> tasksByStatus;
    private Map<Priority, Long> tasksByPriority;
    private long completedTaskCount;
    private long totalFocusMinutes;

    public ProjectAnalyticsResponse(Long projectId, String projectName, long totalTasks,
                                    Map<TaskStatus, Long> tasksByStatus,
                                    Map<Priority, Long> tasksByPriority,
                                    long completedTaskCount, long totalFocusMinutes) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.totalTasks = totalTasks;
        this.tasksByStatus = tasksByStatus;
        this.tasksByPriority = tasksByPriority;
        this.completedTaskCount = completedTaskCount;
        this.totalFocusMinutes = totalFocusMinutes;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public Map<TaskStatus, Long> getTasksByStatus() {
        return tasksByStatus;
    }

    public Map<Priority, Long> getTasksByPriority() {
        return tasksByPriority;
    }

    public long getCompletedTaskCount() {
        return completedTaskCount;
    }

    public long getTotalFocusMinutes() {
        return totalFocusMinutes;
    }
}
