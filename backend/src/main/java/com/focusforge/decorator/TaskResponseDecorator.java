package com.focusforge.decorator;

import com.focusforge.dto.TaskResponse;
import com.focusforge.entity.Task;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TaskResponseDecorator {

    private final List<TaskMetadataDecorator> decorators;

    public TaskResponseDecorator(List<TaskMetadataDecorator> decorators) {
        this.decorators = decorators;
    }

    public TaskResponse decorate(Task task) {
        TaskDisplayMetadata metadata = new TaskDisplayMetadata();
        decorators.forEach(decorator -> decorator.decorate(task, metadata));
        return TaskResponse.from(task, metadata);
    }

    public List<TaskResponse> decorateAll(List<Task> tasks) {
        return tasks.stream()
                .map(this::decorate)
                .toList();
    }
}
