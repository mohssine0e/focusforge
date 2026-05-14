package com.focusforge.repository;

import com.focusforge.entity.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {
    List<FocusSession> findByTaskIdOrderByStartTimeDesc(Long taskId);

    List<FocusSession> findAllByOrderByStartTimeDesc();
}
