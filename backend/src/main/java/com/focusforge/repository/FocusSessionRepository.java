package com.focusforge.repository;

import com.focusforge.entity.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {
    List<FocusSession> findByTaskIdOrderByStartTimeDesc(Long taskId);

    List<FocusSession> findAllByOrderByStartTimeDesc();

    List<FocusSession> findByTaskIdAndTaskProjectWorkspaceOwnerIdOrderByStartTimeDesc(Long taskId, Long ownerId);

    List<FocusSession> findByTaskProjectWorkspaceOwnerIdOrderByStartTimeDesc(Long ownerId);

    Optional<FocusSession> findByIdAndTaskProjectWorkspaceOwnerId(Long id, Long ownerId);

    Optional<FocusSession> findFirstByTaskProjectWorkspaceOwnerIdAndEndTimeIsNullOrderByStartTimeDesc(Long ownerId);
}
