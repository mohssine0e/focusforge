package com.focusforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "focus_sessions")
public class FocusSession extends BaseEntity {

    @NotNull(message = "Task is required")
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @NotNull(message = "Session type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private FocusSessionType sessionType;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    public FocusSession() {
        super();
    }

    public FocusSession(Task task, LocalDateTime startTime, FocusSessionType sessionType) {
        this.task = task;
        this.startTime = startTime;
        this.sessionType = sessionType;
        this.completed = false;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public FocusSessionType getSessionType() {
        return sessionType;
    }

    public void setSessionType(FocusSessionType sessionType) {
        this.sessionType = sessionType;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
