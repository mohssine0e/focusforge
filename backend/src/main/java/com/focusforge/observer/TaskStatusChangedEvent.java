package com.focusforge.observer;

import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;

public class TaskStatusChangedEvent {

    private final Task task;
    private final TaskStatus previousStatus;
    private final TaskStatus newStatus;

    public TaskStatusChangedEvent(Task task, TaskStatus previousStatus, TaskStatus newStatus) {
        this.task = task;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
    }

    public Task getTask() {
        return task;
    }

    public TaskStatus getPreviousStatus() {
        return previousStatus;
    }

    public TaskStatus getNewStatus() {
        return newStatus;
    }
}
