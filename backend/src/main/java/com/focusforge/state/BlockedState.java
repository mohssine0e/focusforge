package com.focusforge.state;

public class BlockedState implements TaskState {
    @Override
    public boolean canTransitionTo(TaskState targetState) {
        return targetState instanceof InProgressState;
    }
}