package com.focusforge.decorator;

import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DeadlineTaskDecorator implements TaskMetadataDecorator {

    @Override
    public void decorate(Task task, TaskDisplayMetadata metadata) {
        if (task.getDueDate() == null || task.getStatus() == TaskStatus.DONE) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        metadata.setOverdue(task.getDueDate().isBefore(now));
        metadata.setDueSoon(!metadata.isOverdue() && task.getDueDate().isBefore(now.plusDays(2)));
    }
}
