package com.focusforge.command;

import com.focusforge.dto.FocusSessionResponse;
import com.focusforge.entity.FocusSession;
import com.focusforge.repository.FocusSessionRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class FinishFocusSessionCommand implements FocusSessionCommand {

    private final FocusSessionRepository focusSessionRepository;
    private final FocusSession focusSession;

    public FinishFocusSessionCommand(FocusSessionRepository focusSessionRepository, FocusSession focusSession) {
        this.focusSessionRepository = focusSessionRepository;
        this.focusSession = focusSession;
    }

    @Override
    public FocusSessionResponse execute() {
        FocusSession session = findActiveSession();
        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setDurationMinutes(calculateDurationMinutes(session.getStartTime(), endTime));
        session.setCompleted(true);
        return FocusSessionResponse.from(focusSessionRepository.save(session));
    }

    @Override
    public String getHistoryEntry() {
        return "Finished focus session " + focusSession.getId();
    }

    private FocusSession findActiveSession() {
        if (focusSession.getEndTime() != null) {
            throw new IllegalArgumentException("Focus session is already closed");
        }

        return focusSession;
    }

    private int calculateDurationMinutes(LocalDateTime startTime, LocalDateTime endTime) {
        return Math.max(0, (int) ChronoUnit.MINUTES.between(startTime, endTime));
    }
}
