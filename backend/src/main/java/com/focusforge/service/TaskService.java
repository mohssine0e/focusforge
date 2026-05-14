package com.focusforge.service;

import com.focusforge.entity.Project;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskDependency;
import com.focusforge.entity.TaskStatus;
import com.focusforge.entity.TaskType;
import com.focusforge.factory.TaskFactory;
import com.focusforge.observer.TaskObserver;
import com.focusforge.observer.TaskStatusChangedEvent;
import com.focusforge.repository.ProjectRepository;
import com.focusforge.repository.TaskRepository;
import com.focusforge.strategy.TaskSortStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private TaskRepository taskRepository;
    private ProjectRepository projectRepository;
    private TaskStateService taskStateService;
    private TaskDependencyService taskDependencyService;
    private List<TaskObserver> taskObservers;
    private List<TaskSortStrategy> taskSortStrategies;

    @Autowired
    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, TaskStateService taskStateService, TaskDependencyService taskDependencyService, List<TaskObserver> taskObservers, List<TaskSortStrategy> taskSortStrategies) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.taskStateService = taskStateService;
        this.taskDependencyService = taskDependencyService;
        this.taskObservers = taskObservers;
        this.taskSortStrategies = taskSortStrategies;
    }

    public Task createTask(Long projectId, String title, String description, TaskType type) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Task task = TaskFactory.createTask(title, description, project, type);
        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksByProject(Long projectId, String sort) {
        List<Task> tasks = getTasksByProject(projectId);

        if (sort == null || sort.isBlank()) {
            return tasks;
        }

        return taskSortStrategies.stream()
                .filter(strategy -> strategy.getSortKey().equalsIgnoreCase(sort))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported task sort: " + sort))
                .sort(tasks);
    }

    public Task updateTask(Long id, String title, String description, TaskType type) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        task.setTitle(title);
        task.setDescription(description);
        task.setType(type);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task updateTaskStatus(Long id, TaskStatus newStatus) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        TaskStatus previousStatus = task.getStatus();

        // Validate state transition using the State pattern
        if (!taskStateService.isValidTransition(previousStatus, newStatus)) {
            throw new IllegalArgumentException("Invalid task status transition from " + previousStatus + " to " + newStatus);
        }

        // Check dependencies when moving to IN_PROGRESS
        if (newStatus == TaskStatus.IN_PROGRESS && taskDependencyService.hasDependencies(id)) {
            // Check if all dependencies are completed
            List<TaskDependency> dependencies = taskDependencyService.getDependenciesForTask(id);
            for (TaskDependency dependency : dependencies) {
                if (dependency.getDependsOnTask().getStatus() != TaskStatus.DONE) {
                    throw new IllegalArgumentException("Cannot move task to IN_PROGRESS: dependency '" +
                        dependency.getDependsOnTask().getTitle() + "' is not completed");
                }
            }
        }

        task.setStatus(newStatus);
        Task savedTask = taskRepository.save(task);
        notifyTaskStatusChanged(savedTask, previousStatus, newStatus);
        return savedTask;
    }

    private void notifyTaskStatusChanged(Task task, TaskStatus previousStatus, TaskStatus newStatus) {
        TaskStatusChangedEvent event = new TaskStatusChangedEvent(task, previousStatus, newStatus);
        taskObservers.forEach(observer -> observer.onTaskStatusChanged(event));
    }
}
