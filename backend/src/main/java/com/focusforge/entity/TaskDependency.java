package com.focusforge.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_dependencies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"task_id", "depends_on_task_id"})
})
public class TaskDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depends_on_task_id", nullable = false)
    private Task dependsOnTask;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public TaskDependency() {
        this.createdAt = LocalDateTime.now();
    }

    public TaskDependency(Task task, Task dependsOnTask) {
        this();
        this.task = task;
        this.dependsOnTask = dependsOnTask;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
        }

    public void setTask(Task task) {
        this.task = task;
    }

    public Task getDependsOnTask() {
        return dependsOnTask;
    }

    public void setDependsOnTask(Task dependsOnTask) {
        this.dependsOnTask = dependsOnTask;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TaskDependency)) return false;

        TaskDependency that = (TaskDependency) o;

        if (!task.equals(that.task)) return false;
        return dependsOnTask.equals(that.dependsOnTask);
    }

    @Override
    public int hashCode() {
        int result = task.hashCode();
        result = 31 * result + dependsOnTask.hashCode();
        return result;
    }
}