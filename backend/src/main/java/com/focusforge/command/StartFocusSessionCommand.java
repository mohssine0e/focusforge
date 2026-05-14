package com.focusforge.command;

import com.focusforge.dto.FocusSessionResponse;
import com.focusforge.entity.FocusSession;
import com.focusforge.entity.FocusSessionType;
import com.focusforge.entity.Task;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.FocusSessionRepository;
import com.focusforge.repository.TaskRepository;

import java.time.LocalDateTime;

public class StartFocusSessionCommand implements FocusSessionCommand {

    private final FocusSessionRepository focusSessionRepository;
    private final TaskRepository taskRepository;
    private final Long taskId;
    private final FocusSessionType sessionType;

    public StartFocusSessionCommand(FocusSessionRepository focusSessionRepository, TaskRepository taskRepository,
                                    Long taskId, FocusSessionType sessionType) {
        this.focusSessionRepository = focusSessionRepository;
        this.taskRepository = taskRepository;
        this.taskId = taskId;
        this.sessionType = sessionType;
    }

    @Override
    public FocusSessionResponse execute() {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        FocusSessionType resolvedType = sessionType == null ? FocusSessionType.POMODORO : sessionType;
        FocusSession session = new FocusSession(task, LocalDateTime.now(), resolvedType);
        return FocusSessionResponse.from(focusSessionRepository.save(session));
    }

    @Override
    public String getHistoryEntry() {
        return "Started focus session for task " + taskId;
    }
}
