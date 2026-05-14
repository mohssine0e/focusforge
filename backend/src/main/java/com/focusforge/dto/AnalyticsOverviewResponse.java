package com.focusforge.dto;

import com.focusforge.entity.Priority;
import com.focusforge.entity.TaskStatus;

import java.util.Map;

public class AnalyticsOverviewResponse {

    private long totalWorkspaces;
    private long totalProjects;
    private long totalTasks;
    private Map<TaskStatus, Long> tasksByStatus;
    private Map<Priority, Long> tasksByPriority;
    private long completedTaskCount;
    private long totalFocusMinutes;

    public AnalyticsOverviewResponse(long totalWorkspaces, long totalProjects, long totalTasks,
                                     Map<TaskStatus, Long> tasksByStatus,
                                     Map<Priority, Long> tasksByPriority,
                                     long completedTaskCount, long totalFocusMinutes) {
        this.totalWorkspaces = totalWorkspaces;
        this.totalProjects = totalProjects;
        this.totalTasks = totalTasks;
        this.tasksByStatus = tasksByStatus;
        this.tasksByPriority = tasksByPriority;
        this.completedTaskCount = completedTaskCount;
        this.totalFocusMinutes = totalFocusMinutes;
    }

    public long getTotalWorkspaces() {
        return totalWorkspaces;
    }

    public long getTotalProjects() {
        return totalProjects;
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
