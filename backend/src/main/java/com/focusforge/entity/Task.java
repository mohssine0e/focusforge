package com.focusforge.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "tasks")
public class Task extends BaseEntity {

    @NotBlank
    @Size(max = 200)
    @Column(name = "title")
    private String title;

    @Column(length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TaskStatus status;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TaskType type;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TaskDependency> dependencies;

    @OneToMany(mappedBy = "dependsOnTask", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TaskDependency> dependents;

    // Constructors
    public Task() {
        super();
    }

    public Task(String title, String description, TaskStatus status, TaskType type, Priority priority,
               LocalDateTime dueDate, Integer estimatedMinutes, Project project) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.type = type;
        this.priority = priority;
        this.dueDate = dueDate;
        this.estimatedMinutes = estimatedMinutes;
        this.project = project;
    }

    // Getters and Setters
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

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
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

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Set<TaskDependency> getDependencies() {
        return dependencies;
    }

    public void setDependencies(Set<TaskDependency> dependencies) {
        this.dependencies = dependencies;
    }

    public Set<TaskDependency> getDependents() {
        return dependents;
    }

    public void setDependents(Set<TaskDependency> dependents) {
        this.dependents = dependents;
    }
}