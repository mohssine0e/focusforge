package com.focusforge.service;

import com.focusforge.entity.Project;
import com.focusforge.entity.Workspace;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.ProjectRepository;
import com.focusforge.repository.WorkspaceRepository;
import com.focusforge.dto.ProjectRequest;
import com.focusforge.dto.ProjectResponse;
import com.focusforge.builder.ProjectBuilder;
import com.focusforge.security.CurrentUserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final CurrentUserService currentUserService;

    public ProjectService(ProjectRepository projectRepository, WorkspaceRepository workspaceRepository,
                          CurrentUserService currentUserService) {
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
        this.currentUserService = currentUserService;
    }

    public ProjectResponse createProject(Long workspaceId, ProjectRequest request) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(workspaceId, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));

        Project project = new ProjectBuilder.Builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .workspace(workspace)
                .build();

        Project savedProject = projectRepository.save(project);
        return new ProjectResponse(
                savedProject.getId(),
                savedProject.getName(),
                savedProject.getDescription(),
                savedProject.getStatus(),
                savedProject.getPriority(),
                savedProject.getStartDate(),
                savedProject.getDueDate(),
                savedProject.getWorkspace().getId(),
                savedProject.getCreatedAt(),
                savedProject.getUpdatedAt()
        );
    }

    public List<ProjectResponse> getProjectsByWorkspace(Long workspaceId) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        if (workspaceRepository.findByIdAndOwnerId(workspaceId, ownerId).isEmpty()) {
            throw new ResourceNotFoundException("Workspace", workspaceId);
        }

        return projectRepository.findByWorkspaceIdAndWorkspaceOwnerId(workspaceId, ownerId).stream()
                .map(project -> new ProjectResponse(
                        project.getId(),
                        project.getName(),
                        project.getDescription(),
                        project.getStatus(),
                        project.getPriority(),
                        project.getStartDate(),
                        project.getDueDate(),
                        project.getWorkspace().getId(),
                        project.getCreatedAt(),
                        project.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findByIdAndWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getPriority(),
                project.getStartDate(),
                project.getDueDate(),
                project.getWorkspace().getId(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findByIdAndWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setPriority(request.getPriority());
        project.setStartDate(request.getStartDate());
        project.setDueDate(request.getDueDate());
        Project updated = projectRepository.save(project);
        return new ProjectResponse(
                updated.getId(),
                updated.getName(),
                updated.getDescription(),
                updated.getStatus(),
                updated.getPriority(),
                updated.getStartDate(),
                updated.getDueDate(),
                updated.getWorkspace().getId(),
                updated.getCreatedAt(),
                updated.getUpdatedAt()
        );
    }

    public void deleteProject(Long id) {
        Project project = projectRepository.findByIdAndWorkspaceOwnerId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        projectRepository.delete(project);
    }
}
