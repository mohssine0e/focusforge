package com.focusforge.observer;

import com.focusforge.entity.NotificationType;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import com.focusforge.service.NotificationService;
import org.springframework.stereotype.Component;

// cette pattern d'observer est utilisée pour réagir aux changements de statut des tâches,
//  en créant des notifications appropriées pour les utilisateurs concernés, 
//  ce qui améliore l'engagement et la réactivité de l'application.
@Component
public class NotificationObserver implements TaskObserver {

    private final NotificationService notificationService;

    public NotificationObserver(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public void onTaskStatusChanged(TaskStatusChangedEvent event) {
        Task task = event.getTask();
        NotificationType type = resolveNotificationType(event.getNewStatus());
        String message = "Task '" + task.getTitle() + "' moved from "
                + event.getPreviousStatus() + " to " + event.getNewStatus();

        notificationService.createNotification(message, type, task.getProject().getWorkspace().getOwner());
    }

    private NotificationType resolveNotificationType(TaskStatus status) {
        if (status == TaskStatus.DONE) {
            return NotificationType.TASK_COMPLETED;
        }

        if (status == TaskStatus.BLOCKED) {
            return NotificationType.TASK_BLOCKED;
        }

        return NotificationType.TASK_UPDATED;
    }
}
