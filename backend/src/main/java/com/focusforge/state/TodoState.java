package com.focusforge.state;

public class TodoState implements TaskState {
    @Override
    public boolean canTransitionTo(TaskState targetState) {
        return targetState instanceof InProgressState ||
               targetState instanceof BlockedState;
    }
}