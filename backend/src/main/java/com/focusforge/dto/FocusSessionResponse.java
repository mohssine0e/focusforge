package com.focusforge.dto;

import com.focusforge.entity.FocusSession;
import com.focusforge.entity.FocusSessionType;

import java.time.LocalDateTime;

public class FocusSessionResponse {

    private Long id;
    private Long taskId;
    private String taskTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private FocusSessionType sessionType;
    private boolean completed;
    private LocalDateTime createdAt;

    public FocusSessionResponse() {
    }

    public FocusSessionResponse(Long id, Long taskId, String taskTitle, LocalDateTime startTime,
                                LocalDateTime endTime, Integer durationMinutes,
                                FocusSessionType sessionType, boolean completed,
                                LocalDateTime createdAt) {
        this.id = id;
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.sessionType = sessionType;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public static FocusSessionResponse from(FocusSession session) {
        return new FocusSessionResponse(
                session.getId(),
                session.getTask().getId(),
                session.getTask().getTitle(),
                session.getStartTime(),
                session.getEndTime(),
                session.getDurationMinutes(),
                session.getSessionType(),
                session.isCompleted(),
                session.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
