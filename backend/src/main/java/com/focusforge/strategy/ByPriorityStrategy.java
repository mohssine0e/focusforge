package com.focusforge.strategy;

import com.focusforge.entity.Priority;
import com.focusforge.entity.Task;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Component
public class ByPriorityStrategy implements TaskSortStrategy {

    private static final Map<Priority, Integer> PRIORITY_ORDER = Map.of(
            Priority.URGENT, 0,
            Priority.HIGH, 1,
            Priority.MEDIUM, 2,
            Priority.LOW, 3
    );

    @Override
    public String getSortKey() {
        return "priority";
    }

    @Override
    public List<Task> sort(List<Task> tasks) {
        return tasks.stream()
                .sorted(Comparator.comparingInt(task -> PRIORITY_ORDER.getOrDefault(task.getPriority(), 99)))
                .toList();
    }
}
