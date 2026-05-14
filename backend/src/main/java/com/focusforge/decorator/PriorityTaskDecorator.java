package com.focusforge.decorator;

import com.focusforge.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class PriorityTaskDecorator implements TaskMetadataDecorator {

    @Override
    public void decorate(Task task, TaskDisplayMetadata metadata) {
        if (task.getPriority() == null) {
            metadata.setPriorityLabel("No priority");
            return;
        }

        String label = task.getPriority().name().charAt(0)
                + task.getPriority().name().substring(1).toLowerCase()
                + " priority";
        metadata.setPriorityLabel(label);
    }
}
