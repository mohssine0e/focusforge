package com.focusforge.observer;

public interface TaskObserver {
    void onTaskStatusChanged(TaskStatusChangedEvent event);
}
