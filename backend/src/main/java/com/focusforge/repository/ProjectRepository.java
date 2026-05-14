package com.focusforge.repository;

import com.focusforge.entity.Project;
import com.focusforge.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByWorkspaceId(Long workspaceId);

    List<Project> findByWorkspaceIdAndWorkspaceOwnerId(Long workspaceId, Long ownerId);

    List<Project> findByWorkspaceOwnerId(Long ownerId);

    Optional<Project> findByIdAndWorkspaceOwnerId(Long id, Long ownerId);

    long countByWorkspaceOwnerId(Long ownerId);
}
