package com.focusforge.service;

import com.focusforge.dto.AnalyticsOverviewResponse;
import com.focusforge.dto.ProjectAnalyticsResponse;
import com.focusforge.entity.FocusSession;
import com.focusforge.entity.Priority;
import com.focusforge.entity.Project;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.FocusSessionRepository;
import com.focusforge.repository.ProjectRepository;
import com.focusforge.repository.TaskRepository;
import com.focusforge.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final FocusSessionRepository focusSessionRepository;

    public AnalyticsService(WorkspaceRepository workspaceRepository, ProjectRepository projectRepository,
                            TaskRepository taskRepository, FocusSessionRepository focusSessionRepository) {
        this.workspaceRepository = workspaceRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.focusSessionRepository = focusSessionRepository;
    }

    public AnalyticsOverviewResponse getOverview() {
        List<Task> tasks = taskRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate weekEnd = today.plusDays(7);
        LocalDateTime now = LocalDateTime.now();
        long totalFocusMinutes = focusSessionRepository.findAll()
                .stream()
                .mapToLong(this::durationMinutes)
                .sum();

        return new AnalyticsOverviewResponse(
                workspaceRepository.count(),
                projectRepository.count(),
                tasks.size(),
                countBy(tasks, Task::getStatus),
                countBy(tasks, Task::getPriority),
                tasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count(),
                totalFocusMinutes,
                tasks.stream().filter(task -> isOpen(task) && isDueOn(task, today)).count(),
                tasks.stream().filter(task -> isOpen(task) && isDueBetween(task, today, weekEnd)).count(),
                tasks.stream().filter(task -> isOpen(task) && isOverdue(task, now)).count(),
                tasks.stream().filter(task -> isOpen(task) && isHighPriority(task)).count(),
                tasks.stream().filter(task -> task.getStatus() == TaskStatus.BLOCKED).count()
        );
    }

    public ProjectAnalyticsResponse getProjectAnalytics(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        Set<Long> taskIds = tasks.stream().map(Task::getId).collect(Collectors.toSet());
        long totalFocusMinutes = focusSessionRepository.findAll()
                .stream()
                .filter(session -> taskIds.contains(session.getTask().getId()))
                .mapToLong(this::durationMinutes)
                .sum();

        return new ProjectAnalyticsResponse(
                project.getId(),
                project.getName(),
                tasks.size(),
                countBy(tasks, Task::getStatus),
                countBy(tasks, Task::getPriority),
                tasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count(),
                totalFocusMinutes
        );
    }

    private <T> Map<T, Long> countBy(List<Task> tasks, Function<Task, T> classifier) {
        return tasks.stream().collect(Collectors.groupingBy(classifier, Collectors.counting()));
    }

    private long durationMinutes(FocusSession session) {
        return session.getDurationMinutes() == null ? 0 : session.getDurationMinutes();
    }

    private boolean isOpen(Task task) {
        return task.getStatus() != TaskStatus.DONE;
    }

    private boolean isDueOn(Task task, LocalDate date) {
        return task.getDueDate() != null && task.getDueDate().toLocalDate().isEqual(date);
    }

    private boolean isDueBetween(Task task, LocalDate start, LocalDate end) {
        if (task.getDueDate() == null) {
            return false;
        }
        LocalDate dueDate = task.getDueDate().toLocalDate();
        return !dueDate.isBefore(start) && !dueDate.isAfter(end);
    }

    private boolean isOverdue(Task task, LocalDateTime now) {
        return task.getDueDate() != null && task.getDueDate().isBefore(now);
    }

    private boolean isHighPriority(Task task) {
        return task.getPriority() == Priority.HIGH || task.getPriority() == Priority.URGENT;
    }
}
