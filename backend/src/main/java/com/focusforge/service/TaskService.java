package com.focusforge.service;

import com.focusforge.entity.Project;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskDependency;
import com.focusforge.entity.TaskStatus;
import com.focusforge.entity.TaskType;
import com.focusforge.dto.TaskRequest;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.factory.TaskFactory;
import com.focusforge.observer.TaskObserver;
import com.focusforge.observer.TaskStatusChangedEvent;
import com.focusforge.repository.ProjectRepository;
import com.focusforge.repository.TaskRepository;
import com.focusforge.security.CurrentUserService;
import com.focusforge.strategy.TaskRecommendationStrategy;
import com.focusforge.strategy.TaskSortStrategy;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskStateService taskStateService;
    private final TaskDependencyService taskDependencyService;
    private final List<TaskObserver> taskObservers;
    private final List<TaskSortStrategy> taskSortStrategies;
    private final List<TaskRecommendationStrategy> taskRecommendationStrategies;
    private final CurrentUserService currentUserService;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository,
                       TaskStateService taskStateService, TaskDependencyService taskDependencyService,
                       List<TaskObserver> taskObservers, List<TaskSortStrategy> taskSortStrategies,
                       List<TaskRecommendationStrategy> taskRecommendationStrategies,
                       CurrentUserService currentUserService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.taskStateService = taskStateService;
        this.taskDependencyService = taskDependencyService;
        this.taskObservers = taskObservers;
        this.taskSortStrategies = taskSortStrategies;
        this.taskRecommendationStrategies = taskRecommendationStrategies;
        this.currentUserService = currentUserService;
    }

    public Task createTask(Long projectId, String title, String description, TaskType type) {
        Project project = projectRepository.findByIdAndWorkspaceOwnerId(projectId, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        Task task = TaskFactory.createTask(title, description, project, type);
        return taskRepository.save(task);
    }

    public Task createTask(Long projectId, TaskRequest request) {
        Project project = projectRepository.findByIdAndWorkspaceOwnerId(projectId, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        Task task = TaskFactory.createTask(
                request.getTitle(),
                request.getDescription(),
                project,
                request.getType(),
                request.getStatus(),
                request.getPriority(),
                request.getDueDate(),
                request.getEstimatedMinutes());
        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectIdAndProjectWorkspaceOwnerId(projectId, currentUserService.getCurrentUser().getId());
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

    public Optional<Task> getRecommendedTask(Long projectId, String strategyKey) {
        String resolvedStrategyKey = (strategyKey == null || strategyKey.isBlank()) ? "priority" : strategyKey;
        List<Task> tasks = getTasksByProject(projectId);

        return taskRecommendationStrategies.stream()
                .filter(strategy -> strategy.getStrategyKey().equalsIgnoreCase(resolvedStrategyKey))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported recommendation strategy: " + resolvedStrategyKey))
                .recommend(tasks);
    }

    public Task updateTask(Long id, String title, String description, TaskType type) {
        Task task = taskRepository.findByIdAndProjectWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        task.setTitle(title);
        task.setDescription(description);
        task.setType(type);
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findByIdAndProjectWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setType(request.getType());
        task.setPriority(request.getPriority() == null ? task.getPriority() : request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setEstimatedMinutes(request.getEstimatedMinutes());
        if (request.getStatus() != null && request.getStatus() != task.getStatus()) {
            return updateTaskStatus(id, request.getStatus());
        }
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findByIdAndProjectWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        taskRepository.delete(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findByProjectWorkspaceOwnerId(currentUserService.getCurrentUser().getId());
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findByIdAndProjectWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId());
    }

    public List<Task> getDueTasks(LocalDate from, LocalDate to, Long workspaceId, Long projectId) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("from date must be before or equal to to date");
        }

        LocalDateTime fromDate = from == null ? null : from.atStartOfDay();
        LocalDateTime toDate = to == null ? null : to.atTime(LocalTime.MAX);
        Specification<Task> dueTaskSpec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isNotNull(root.get("dueDate")));

            if (fromDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dueDate"), fromDate));
            }

            if (toDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dueDate"), toDate));
            }

            if (workspaceId != null || projectId != null) {
                Join<Object, Object> project = root.join("project");
                if (workspaceId != null) {
                    predicates.add(criteriaBuilder.equal(project.get("workspace").get("id"), workspaceId));
                }
                if (projectId != null) {
                    predicates.add(criteriaBuilder.equal(project.get("id"), projectId));
                }
            }

            Join<Object, Object> ownerProject = root.join("project");
            predicates.add(criteriaBuilder.equal(ownerProject.get("workspace").get("owner").get("id"), currentUserService.getCurrentUser().getId()));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return taskRepository.findAll(dueTaskSpec, Sort.by(Sort.Direction.ASC, "dueDate"));
    }

    public Task updateTaskStatus(Long id, TaskStatus newStatus) {
        Task task = taskRepository.findByIdAndProjectWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
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
