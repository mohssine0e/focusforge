package com.focusforge.service;

import com.focusforge.dto.TaskDependencyResponse;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskDependency;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.TaskDependencyRepository;
import com.focusforge.repository.TaskRepository;
import com.focusforge.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class TaskDependencyService {

    private final TaskDependencyRepository taskDependencyRepository;
    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;

    public TaskDependencyService(TaskDependencyRepository taskDependencyRepository, TaskRepository taskRepository,
                                 CurrentUserService currentUserService) {
        this.taskDependencyRepository = taskDependencyRepository;
        this.taskRepository = taskRepository;
        this.currentUserService = currentUserService;
    }

    public TaskDependencyResponse addDependency(Long taskId, Long dependsOnTaskId) {
        if (taskId.equals(dependsOnTaskId)) {
            throw new IllegalArgumentException("A task cannot depend on itself");
        }

        Task task = findTask(taskId);
        Task dependsOnTask = findTask(dependsOnTaskId);

        if (taskDependencyRepository.existsByTaskIdAndDependsOnTaskId(taskId, dependsOnTaskId)) {
            throw new IllegalArgumentException("Dependency already exists");
        }

        if (hasDependencyPath(dependsOnTaskId, taskId, new HashSet<>())) {
            throw new IllegalArgumentException("Circular dependency detected");
        }

        TaskDependency dependency = new TaskDependency(task, dependsOnTask);
        return TaskDependencyResponse.from(taskDependencyRepository.save(dependency));
    }

    public void removeDependency(Long taskId, Long dependsOnTaskId) {
        findTask(taskId);
        findTask(dependsOnTaskId);
        TaskDependency dependency = taskDependencyRepository.findByTaskIdAndDependsOnTaskId(taskId, dependsOnTaskId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Dependency not found for task " + taskId + " and dependency " + dependsOnTaskId));
        taskDependencyRepository.delete(dependency);
    }

    @Transactional(readOnly = true)
    public List<TaskDependencyResponse> getDependencyResponsesForTask(Long taskId) {
        findTask(taskId);
        return taskDependencyRepository.findByTaskId(taskId)
                .stream()
                .map(TaskDependencyResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskDependency> getDependenciesForTask(Long taskId) {
        findTask(taskId);
        return taskDependencyRepository.findByTaskId(taskId);
    }

    @Transactional(readOnly = true)
    public List<TaskDependency> getDependentsForTask(Long dependsOnTaskId) {
        findTask(dependsOnTaskId);
        return taskDependencyRepository.findByDependsOnTaskId(dependsOnTaskId);
    }

    @Transactional(readOnly = true)
    public boolean hasDependencies(Long taskId) {
        return !taskDependencyRepository.findByTaskId(taskId).isEmpty();
    }

    @Transactional(readOnly = true)
    public boolean hasDependents(Long dependsOnTaskId) {
        return !taskDependencyRepository.findByDependsOnTaskId(dependsOnTaskId).isEmpty();
    }

    private Task findTask(Long taskId) {
        return taskRepository.findByIdAndProjectWorkspaceOwnerId(taskId, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
    }

    private boolean hasDependencyPath(Long startTaskId, Long targetTaskId, Set<Long> visitedTaskIds) {
        if (startTaskId.equals(targetTaskId)) {
            return true;
        }

        if (!visitedTaskIds.add(startTaskId)) {
            return false;
        }

        return taskDependencyRepository.findByTaskId(startTaskId)
                .stream()
                .anyMatch(dependency -> hasDependencyPath(
                        dependency.getDependsOnTask().getId(),
                        targetTaskId,
                        visitedTaskIds));
    }
}
