package com.focusforge.service;

import com.focusforge.entity.Workspace;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.exception.ValidationException;
import com.focusforge.repository.WorkspaceRepository;
import com.focusforge.dto.WorkspaceRequest;
import com.focusforge.dto.WorkspaceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    public WorkspaceResponse createWorkspace(WorkspaceRequest request) {
        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());

        Workspace saved = workspaceRepository.save(workspace);
        return new WorkspaceResponse(
                saved.getId(),
                saved.getName(),
                saved.getDescription(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    public List<WorkspaceResponse> getAllWorkspaces() {
        return workspaceRepository.findAll().stream()
                .map(workspace -> new WorkspaceResponse(
                        workspace.getId(),
                        workspace.getName(),
                        workspace.getDescription(),
                        workspace.getCreatedAt(),
                        workspace.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    public WorkspaceResponse getWorkspaceById(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getCreatedAt(),
                workspace.getUpdatedAt()
        );
    }

    public WorkspaceResponse updateWorkspace(Long id, WorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        Workspace updated = workspaceRepository.save(workspace);
        return new WorkspaceResponse(
                updated.getId(),
                updated.getName(),
                updated.getDescription(),
                updated.getCreatedAt(),
                updated.getUpdatedAt()
        );
    }

    public void deleteWorkspace(Long id) {
        if (!workspaceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Workspace", id);
        }
        workspaceRepository.deleteById(id);
    }
}