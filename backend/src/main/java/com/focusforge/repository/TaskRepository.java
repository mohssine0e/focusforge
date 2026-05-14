package com.focusforge.repository;

import com.focusforge.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByProjectIdAndProjectWorkspaceOwnerId(Long projectId, Long ownerId);

    List<Task> findByProjectWorkspaceOwnerId(Long ownerId);

    Optional<Task> findByIdAndProjectWorkspaceOwnerId(Long id, Long ownerId);

    long countByProjectWorkspaceOwnerId(Long ownerId);
}
