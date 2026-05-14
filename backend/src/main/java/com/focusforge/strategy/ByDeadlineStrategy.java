package com.focusforge.strategy;

import com.focusforge.entity.Task;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Component
public class ByDeadlineStrategy implements TaskSortStrategy {

    @Override
    public String getSortKey() {
        return "deadline";
    }

    @Override
    public List<Task> sort(List<Task> tasks) {
        return tasks.stream()
                .sorted(Comparator.comparing(
                        Task::getDueDate,
                        Comparator.nullsLast(LocalDateTime::compareTo)))
                .toList();
    }
}
