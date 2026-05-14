package com.focusforge.factory;

import com.focusforge.entity.*;
import com.focusforge.entity.Project;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskType;

import java.time.LocalDateTime;

//cette patern de factory est utilisée pour centraliser la création d'instances de Task,
//  en fournissant des méthodes statiques pour créer des tâches avec différentes configurations, ce qui facilite la maintenance et la cohérence du code.
public class TaskFactory {

    public static Task createTask(String title, String description, Project project) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setProject(project);
        task.setStatus(com.focusforge.entity.TaskStatus.TODO);
        task.setType(TaskType.STUDY);
        task.setPriority(Priority.MEDIUM);
        return task;
    }

    public static Task createTask(String title, String description, Project project, TaskType type) {
        Task task = createTask(title, description, project);
        task.setType(type);
        setDefaultEstimate(task, type);
        return task;
    }

    public static Task createTask(String title, String description, Project project, TaskType type,
            TaskStatus status, Priority priority, LocalDateTime dueDate,
            Integer estimatedMinutes) {
        Task task = createTask(title, description, project, type);
        task.setStatus(status == null ? TaskStatus.TODO : status);
        task.setPriority(priority == null ? Priority.MEDIUM : priority);
        task.setDueDate(dueDate);
        if (estimatedMinutes != null) {
            task.setEstimatedMinutes(estimatedMinutes);
        }
        return task;
    }

    private static void setDefaultEstimate(Task task, TaskType type) {
        switch (type) {
            case STUDY:
                task.setEstimatedMinutes(60);
                break;
            case CODING:
                task.setEstimatedMinutes(90);
                break;
            case RESEARCH:
                task.setEstimatedMinutes(45);
                break;
            case ADMIN:
                task.setEstimatedMinutes(30);
                break;
        }
    }

    public static Task createStudyTask(String title, String description, Project project) {
        return createTask(title, description, project, TaskType.STUDY);
    }

    public static Task createCodingTask(String title, String description, Project project) {
        return createTask(title, description, project, TaskType.CODING);
    }

    public static Task createResearchTask(String title, String description, Project project) {
        return createTask(title, description, project, TaskType.RESEARCH);
    }

    public static Task createAdminTask(String title, String description, Project project) {
        return createTask(title, description, project, TaskType.ADMIN);
    }
}
