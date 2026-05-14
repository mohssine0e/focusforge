package com.focusforge.repository;

import com.focusforge.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    boolean existsByName(String name);

    boolean existsByNameAndOwnerId(String name, Long ownerId);

    List<Workspace> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Workspace> findByIdAndOwnerId(Long id, Long ownerId);
}
