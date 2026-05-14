package com.focusforge.service;

import com.focusforge.entity.AppUser;
import com.focusforge.entity.Notification;
import com.focusforge.entity.NotificationType;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.NotificationRepository;
import com.focusforge.security.CurrentUserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(NotificationRepository notificationRepository, CurrentUserService currentUserService) {
        this.notificationRepository = notificationRepository;
        this.currentUserService = currentUserService;
    }

    public Notification createNotification(String message, NotificationType type) {
        Notification notification = new Notification(message, type, currentUserService.getCurrentUser());
        return notificationRepository.save(notification);
    }

    public Notification createNotification(String message, NotificationType type, AppUser owner) {
        Notification notification = new Notification(message, type, owner);
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findByOwnerIdOrderByCreatedAtDesc(currentUserService.getCurrentUser().getId());
    }

    public long getUnreadCount() {
        return notificationRepository.countByOwnerIdAndReadFalse(currentUserService.getCurrentUser().getId());
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findByIdAndOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findByIdAndOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notificationRepository.delete(notification);
    }
}
