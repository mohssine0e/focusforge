package com.focusforge.strategy;

import com.focusforge.entity.Priority;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class PriorityFirstRecommendationStrategy implements TaskRecommendationStrategy {

    private static final Map<Priority, Integer> PRIORITY_ORDER = Map.of(
            Priority.URGENT, 0,
            Priority.HIGH, 1,
            Priority.MEDIUM, 2,
            Priority.LOW, 3
    );

    @Override
    public String getStrategyKey() {
        return "priority";
    }

    @Override
    public Optional<Task> recommend(List<Task> tasks) {
        return tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .min(Comparator.comparingInt(task -> PRIORITY_ORDER.getOrDefault(task.getPriority(), 99)));
    }
}
