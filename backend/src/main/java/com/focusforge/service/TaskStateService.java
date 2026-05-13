package com.focusforge.service;

import com.focusforge.entity.TaskStatus;
import com.focusforge.state.*;
import org.springframework.stereotype.Service;

@Service
public class TaskStateService {

    public TaskState getStateForStatus(TaskStatus status) {
        switch (status) {
            case TODO:
                return new TodoState();
            case IN_PROGRESS:
                return new InProgressState();
            case BLOCKED:
                return new BlockedState();
            case REVIEW:
                return new ReviewState();
            case DONE:
                return new DoneState();
            default:
                throw new IllegalArgumentException("Unknown task status: " + status);
        }
    }

    public boolean isValidTransition(TaskStatus from, TaskStatus to) {
        TaskState fromState = getStateForStatus(from);
        TaskState toState = getStateForStatus(to);
        return fromState.canTransitionTo(toState);
    }
}