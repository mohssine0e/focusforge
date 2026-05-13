package com.focusforge.state;

public class DoneState implements TaskState {
    @Override
    public boolean canTransitionTo(TaskState targetState) {
        return false; // No transitions allowed from DONE state
    }
}