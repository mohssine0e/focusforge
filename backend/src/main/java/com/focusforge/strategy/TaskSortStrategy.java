package com.focusforge.strategy;

import com.focusforge.entity.Task;

import java.util.List;

public interface TaskSortStrategy {
    String getSortKey();

    List<Task> sort(List<Task> tasks);
}
