package com.focusforge.command;

import com.focusforge.dto.FocusSessionResponse;
import com.focusforge.entity.FocusSession;
import com.focusforge.entity.FocusSessionType;
import com.focusforge.entity.Task;
import com.focusforge.repository.FocusSessionRepository;

import java.time.LocalDateTime;

// cette pattern de commande est utilisée pour encapsuler la logique de démarrage d'une session de focus,
//  en séparant les préoccupations et en facilitant la maintenance du code.
public class StartFocusSessionCommand implements FocusSessionCommand {

    private final FocusSessionRepository focusSessionRepository;
    private final Task task;
    private final FocusSessionType sessionType;

    public StartFocusSessionCommand(FocusSessionRepository focusSessionRepository, Task task, FocusSessionType sessionType) {
        this.focusSessionRepository = focusSessionRepository;
        this.task = task;
        this.sessionType = sessionType;
    }

    @Override
    public FocusSessionResponse execute() {
        FocusSessionType resolvedType = sessionType == null ? FocusSessionType.POMODORO : sessionType;
        FocusSession session = new FocusSession(task, LocalDateTime.now(), resolvedType);
        return FocusSessionResponse.from(focusSessionRepository.save(session));
    }

    @Override
    public String getHistoryEntry() {
        return "Started focus session for task " + task.getId();
    }
}
