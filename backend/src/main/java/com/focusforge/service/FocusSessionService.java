package com.focusforge.service;

import com.focusforge.command.CancelFocusSessionCommand;
import com.focusforge.command.FinishFocusSessionCommand;
import com.focusforge.command.FocusSessionCommand;
import com.focusforge.command.StartFocusSessionCommand;
import com.focusforge.dto.FocusSessionResponse;
import com.focusforge.entity.FocusSession;
import com.focusforge.entity.FocusSessionType;
import com.focusforge.entity.Task;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.FocusSessionRepository;
import com.focusforge.repository.TaskRepository;
import com.focusforge.security.CurrentUserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;
    private final List<String> actionHistory = new CopyOnWriteArrayList<>();

    public FocusSessionService(FocusSessionRepository focusSessionRepository, TaskRepository taskRepository,
                               CurrentUserService currentUserService) {
        this.focusSessionRepository = focusSessionRepository;
        this.taskRepository = taskRepository;
        this.currentUserService = currentUserService;
    }

    public FocusSessionResponse startSession(Long taskId, FocusSessionType sessionType) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        Task task = taskRepository.findByIdAndProjectWorkspaceOwnerId(taskId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        focusSessionRepository.findFirstByTaskProjectWorkspaceOwnerIdAndEndTimeIsNullOrderByStartTimeDesc(ownerId)
                .ifPresent(active -> {
                    throw new IllegalArgumentException("Finish or cancel the active focus session before starting another");
                });
        return executeCommand(new StartFocusSessionCommand(focusSessionRepository, task, sessionType));
    }

    public FocusSessionResponse finishSession(Long sessionId) {
        FocusSession session = focusSessionRepository.findByIdAndTaskProjectWorkspaceOwnerId(sessionId, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession", sessionId));
        return executeCommand(new FinishFocusSessionCommand(focusSessionRepository, session));
    }

    public FocusSessionResponse cancelSession(Long sessionId) {
        FocusSession session = focusSessionRepository.findByIdAndTaskProjectWorkspaceOwnerId(sessionId, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession", sessionId));
        return executeCommand(new CancelFocusSessionCommand(focusSessionRepository, session));
    }

    public List<FocusSessionResponse> getSessionsByTask(Long taskId) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        if (taskRepository.findByIdAndProjectWorkspaceOwnerId(taskId, ownerId).isEmpty()) {
            throw new ResourceNotFoundException("Task", taskId);
        }

        return focusSessionRepository.findByTaskIdAndTaskProjectWorkspaceOwnerIdOrderByStartTimeDesc(taskId, ownerId)
                .stream()
                .map(FocusSessionResponse::from)
                .toList();
    }

    public List<FocusSessionResponse> getAllSessions() {
        return focusSessionRepository.findByTaskProjectWorkspaceOwnerIdOrderByStartTimeDesc(currentUserService.getCurrentUser().getId())
                .stream()
                .map(FocusSessionResponse::from)
                .toList();
    }

    public FocusSessionResponse getActiveSession() {
        return focusSessionRepository
                .findFirstByTaskProjectWorkspaceOwnerIdAndEndTimeIsNullOrderByStartTimeDesc(currentUserService.getCurrentUser().getId())
                .map(FocusSessionResponse::from)
                .orElse(null);
    }

    public List<String> getActionHistory() {
        return List.copyOf(actionHistory);
    }

    private FocusSessionResponse executeCommand(FocusSessionCommand command) {
        FocusSessionResponse response = command.execute();
        actionHistory.add(command.getHistoryEntry());
        return response;
    }
}
