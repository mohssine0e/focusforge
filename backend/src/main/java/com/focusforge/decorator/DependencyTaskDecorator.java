package com.focusforge.decorator;

import com.focusforge.entity.Task;
import com.focusforge.entity.TaskDependency;
import com.focusforge.entity.TaskStatus;
import com.focusforge.repository.TaskDependencyRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DependencyTaskDecorator implements TaskMetadataDecorator {

    private final TaskDependencyRepository taskDependencyRepository;

    public DependencyTaskDecorator(TaskDependencyRepository taskDependencyRepository) {
        this.taskDependencyRepository = taskDependencyRepository;
    }

    @Override
    public void decorate(Task task, TaskDisplayMetadata metadata) {
        List<String> openDependencyTitles = taskDependencyRepository.findByTaskId(task.getId())
                .stream()
                .map(TaskDependency::getDependsOnTask)
                .filter(dependsOnTask -> dependsOnTask.getStatus() != TaskStatus.DONE)
                .map(Task::getTitle)
                .toList();

        if (openDependencyTitles.isEmpty()) {
            return;
        }

        metadata.setDependencyWarning(true);
        metadata.setBlockedReason("Waiting on " + String.join(", ", openDependencyTitles));
    }
}
