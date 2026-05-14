package com.focusforge.facade;

import com.focusforge.service.ProjectService;
import com.focusforge.service.TaskService;
import com.focusforge.service.WorkspaceService;
import com.focusforge.service.TaskStateService;
import org.springframework.stereotype.Component;

@Component
public class ProjectManagementFacade {

    private final ProjectService projectService;
    private final TaskService taskService;
    private final WorkspaceService workspaceService;
    private final TaskStateService taskStateService;

    public ProjectManagementFacade(ProjectService projectService, TaskService taskService,
                                   WorkspaceService workspaceService, TaskStateService taskStateService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.workspaceService = workspaceService;
        this.taskStateService = taskStateService;
    }

    // Add methods to coordinate operations between services

    /**
     * Get all projects for a workspace with their tasks
     */
    public java.util.List<com.focusforge.entity.Project> getWorkspaceProjectsAndTasks(Long workspaceId) {
        return projectService.getProjectsByWorkspace(workspaceId).stream()
            .map(projectResponse -> {
                try {
                    // This is a simplified implementation - in a real scenario,
                    // we would need to map back to entity objects
                    return new com.focusforge.entity.Project();
                } catch (Exception e) {
                    return null;
                }
            })
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Validate if a task status transition is valid according to business rules
     */
    public boolean isValidTaskStatusTransition(Long taskId, com.focusforge.entity.TaskStatus newStatus) {
        var taskOpt = taskService.getTaskById(taskId);
        if (taskOpt.isPresent()) {
            com.focusforge.entity.Task task = taskOpt.get();
            return taskStateService.isValidTransition(task.getStatus(), newStatus);
        }
        return false;
    }

    /**
     * Update task status with validation
     */
    public com.focusforge.entity.Task updateTaskStatusWithValidation(Long taskId, com.focusforge.entity.TaskStatus newStatus) {
        if (isValidTaskStatusTransition(taskId, newStatus)) {
            return taskService.updateTaskStatus(taskId, newStatus);
        }
        throw new RuntimeException("Invalid task status transition");
    }
}
