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
    private long tasksDueToday;
    private long tasksDueThisWeek;
    private long overdueTasks;
    private long highPriorityOpenTasks;
    private long blockedTasks;

    public AnalyticsOverviewResponse(long totalWorkspaces, long totalProjects, long totalTasks,
                                     Map<TaskStatus, Long> tasksByStatus,
                                     Map<Priority, Long> tasksByPriority,
                                     long completedTaskCount, long totalFocusMinutes,
                                     long tasksDueToday, long tasksDueThisWeek,
                                     long overdueTasks, long highPriorityOpenTasks,
                                     long blockedTasks) {
        this.totalWorkspaces = totalWorkspaces;
        this.totalProjects = totalProjects;
        this.totalTasks = totalTasks;
        this.tasksByStatus = tasksByStatus;
        this.tasksByPriority = tasksByPriority;
        this.completedTaskCount = completedTaskCount;
        this.totalFocusMinutes = totalFocusMinutes;
        this.tasksDueToday = tasksDueToday;
        this.tasksDueThisWeek = tasksDueThisWeek;
        this.overdueTasks = overdueTasks;
        this.highPriorityOpenTasks = highPriorityOpenTasks;
        this.blockedTasks = blockedTasks;
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

    public long getTasksDueToday() {
        return tasksDueToday;
    }

    public long getTasksDueThisWeek() {
        return tasksDueThisWeek;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public long getHighPriorityOpenTasks() {
        return highPriorityOpenTasks;
    }

    public long getBlockedTasks() {
        return blockedTasks;
    }
}
