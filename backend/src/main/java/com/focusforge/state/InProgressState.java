package com.focusforge.state;

public class InProgressState implements TaskState {
    @Override
    public boolean canTransitionTo(TaskState targetState) {
        return targetState instanceof ReviewState ||
               targetState instanceof BlockedState;
    }
}