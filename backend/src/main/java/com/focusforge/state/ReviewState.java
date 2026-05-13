package com.focusforge.state;

public class ReviewState implements TaskState {
    @Override
    public boolean canTransitionTo(TaskState targetState) {
        return targetState instanceof DoneState;
    }
}