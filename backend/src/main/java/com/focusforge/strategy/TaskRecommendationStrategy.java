package com.focusforge.strategy;

import com.focusforge.entity.Task;

import java.util.List;
import java.util.Optional;

public interface TaskRecommendationStrategy {
    String getStrategyKey();

    Optional<Task> recommend(List<Task> tasks);
}
