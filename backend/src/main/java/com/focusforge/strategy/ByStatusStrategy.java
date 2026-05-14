package com.focusforge.strategy;

import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Component
public class ByStatusStrategy implements TaskSortStrategy {

    private static final Map<TaskStatus, Integer> STATUS_ORDER = Map.of(
            TaskStatus.TODO, 0,
            TaskStatus.IN_PROGRESS, 1,
            TaskStatus.BLOCKED, 2,
            TaskStatus.REVIEW, 3,
            TaskStatus.DONE, 4
    );

    @Override
    public String getSortKey() {
        return "status";
    }

    @Override
    public List<Task> sort(List<Task> tasks) {
        return tasks.stream()
                .sorted(Comparator.comparingInt(task -> STATUS_ORDER.getOrDefault(task.getStatus(), 99)))
                .toList();
    }
}
