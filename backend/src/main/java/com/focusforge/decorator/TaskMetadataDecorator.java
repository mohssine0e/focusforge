package com.focusforge.decorator;

import com.focusforge.entity.Task;

public interface TaskMetadataDecorator {
    void decorate(Task task, TaskDisplayMetadata metadata);
}
