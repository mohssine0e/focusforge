package com.focusforge.service;

import com.focusforge.command.CancelFocusSessionCommand;
import com.focusforge.command.FinishFocusSessionCommand;
import com.focusforge.command.FocusSessionCommand;
import com.focusforge.command.StartFocusSessionCommand;
import com.focusforge.dto.FocusSessionResponse;
import com.focusforge.entity.FocusSessionType;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.FocusSessionRepository;
import com.focusforge.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final TaskRepository taskRepository;
    private final List<String> actionHistory = new CopyOnWriteArrayList<>();

    public FocusSessionService(FocusSessionRepository focusSessionRepository, TaskRepository taskRepository) {
        this.focusSessionRepository = focusSessionRepository;
        this.taskRepository = taskRepository;
    }

    public FocusSessionResponse startSession(Long taskId, FocusSessionType sessionType) {
        return executeCommand(new StartFocusSessionCommand(
                focusSessionRepository,
                taskRepository,
                taskId,
                sessionType));
    }

    public FocusSessionResponse finishSession(Long sessionId) {
        return executeCommand(new FinishFocusSessionCommand(focusSessionRepository, sessionId));
    }

    public FocusSessionResponse cancelSession(Long sessionId) {
        return executeCommand(new CancelFocusSessionCommand(focusSessionRepository, sessionId));
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

    public List<String> getActionHistory() {
        return List.copyOf(actionHistory);
    }

    private FocusSessionResponse executeCommand(FocusSessionCommand command) {
        FocusSessionResponse response = command.execute();
        actionHistory.add(command.getHistoryEntry());
        return response;
    }
}
