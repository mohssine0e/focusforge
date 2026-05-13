package com.focusforge.service;

import com.focusforge.entity.Project;
import com.focusforge.entity.Workspace;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.repository.ProjectRepository;
import com.focusforge.repository.WorkspaceRepository;
import com.focusforge.dto.ProjectRequest;
import com.focusforge.dto.ProjectResponse;
import com.focusforge.builder.ProjectBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    public ProjectResponse createProject(Long workspaceId, ProjectRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
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
        return projectRepository.findByWorkspaceId(workspaceId).stream()
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
        Project project = projectRepository.findById(id)
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
        Project project = projectRepository.findById(id)
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
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project", id);
        }
        projectRepository.deleteById(id);
    }
}