package com.focusforge.repository;

import com.focusforge.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();

    long countByReadFalse();

    List<Notification> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    long countByOwnerIdAndReadFalse(Long ownerId);

    Optional<Notification> findByIdAndOwnerId(Long id, Long ownerId);
}
