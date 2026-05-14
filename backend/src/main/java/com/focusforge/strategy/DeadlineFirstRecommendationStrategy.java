package com.focusforge.strategy;

import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
public class DeadlineFirstRecommendationStrategy implements TaskRecommendationStrategy {

    @Override
    public String getStrategyKey() {
        return "deadline";
    }

    @Override
    public Optional<Task> recommend(List<Task> tasks) {
        return tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .min(Comparator.comparing(
                        Task::getDueDate,
                        Comparator.nullsLast(LocalDateTime::compareTo)));
    }
}
