package com.focusforge.state;

public interface TaskState {
    boolean canTransitionTo(TaskState targetState);
}