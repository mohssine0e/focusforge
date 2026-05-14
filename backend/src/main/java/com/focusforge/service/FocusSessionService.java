package com.focusforge.service;

import com.focusforge.dto.FocusSessionResponse;
import com.focusforge.entity.FocusSession;
import com.focusforge.entity.FocusSessionType;
import com.focusforge.entity.Task;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.FocusSessionRepository;
import com.focusforge.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final TaskRepository taskRepository;

    public FocusSessionService(FocusSessionRepository focusSessionRepository, TaskRepository taskRepository) {
        this.focusSessionRepository = focusSessionRepository;
        this.taskRepository = taskRepository;
    }

    public FocusSessionResponse startSession(Long taskId, FocusSessionType sessionType) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        FocusSessionType resolvedType = sessionType == null ? FocusSessionType.POMODORO : sessionType;
        FocusSession session = new FocusSession(task, LocalDateTime.now(), resolvedType);
        return FocusSessionResponse.from(focusSessionRepository.save(session));
    }

    public FocusSessionResponse finishSession(Long sessionId) {
        FocusSession session = findActiveSession(sessionId);
        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setDurationMinutes(calculateDurationMinutes(session.getStartTime(), endTime));
        session.setCompleted(true);
        return FocusSessionResponse.from(focusSessionRepository.save(session));
    }

    public FocusSessionResponse cancelSession(Long sessionId) {
        FocusSession session = findActiveSession(sessionId);
        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setDurationMinutes(calculateDurationMinutes(session.getStartTime(), endTime));
        session.setCompleted(false);
        return FocusSessionResponse.from(focusSessionRepository.save(session));
    }

    public List<FocusSessionResponse> getSessionsByTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task", taskId);
        }

        return focusSessionRepository.findByTaskIdOrderByStartTimeDesc(taskId)
                .stream()
                .map(FocusSessionResponse::from)
                .toList();
    }

    public List<FocusSessionResponse> getAllSessions() {
        return focusSessionRepository.findAllByOrderByStartTimeDesc()
                .stream()
                .map(FocusSessionResponse::from)
                .toList();
    }

    private FocusSession findActiveSession(Long sessionId) {
        FocusSession session = focusSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession", sessionId));

        if (session.getEndTime() != null) {
            throw new IllegalArgumentException("Focus session is already closed");
        }

        return session;
    }

    private int calculateDurationMinutes(LocalDateTime startTime, LocalDateTime endTime) {
        return Math.max(0, (int) ChronoUnit.MINUTES.between(startTime, endTime));
    }
}
