package com.focusforge.service;

import com.focusforge.entity.Project;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import com.focusforge.entity.TaskType;
import com.focusforge.factory.TaskFactory;
import com.focusforge.repository.ProjectRepository;
import com.focusforge.repository.TaskRepository;
import com.focusforge.service.TaskStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private TaskRepository taskRepository;
    private ProjectRepository projectRepository;
    private TaskStateService taskStateService;

    @Autowired
    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, TaskStateService taskStateService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.taskStateService = taskStateService;
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

        // Validate state transition using the State pattern
        if (!taskStateService.isValidTransition(task.getStatus(), newStatus)) {
            // This is a placeholder - we would need to implement the actual validation
            throw new RuntimeException("Invalid task status transition from " + task.getStatus() + " to " + newStatus);
        }

        task.setStatus(newStatus);
        return taskRepository.save(task);
    }
}