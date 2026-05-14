import { httpClient } from './httpClient';
import type { Project, CreateProjectRequest } from '../types';

export type { CreateProjectRequest, Project } from '../types';

class ProjectApi {
  async createProject(workspaceId: number, project: CreateProjectRequest): Promise<Project> {
    const response = await httpClient.post(`/api/workspaces/${workspaceId}/projects`, normalizeProject(project));
    return response.data;
  }

  async getProjects(workspaceId: number): Promise<Project[]> {
    const response = await httpClient.get(`/api/workspaces/${workspaceId}/projects`);
    return response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response = await httpClient.get(`/api/projects/${id}`);
    return response.data;
  }

  async updateProject(id: number, project: CreateProjectRequest): Promise<Project> {
    const response = await httpClient.put(`/api/projects/${id}`, normalizeProject(project));
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await httpClient.delete(`/api/projects/${id}`);
  }
}

export const projectApi = new ProjectApi();

const normalizeProject = (project: CreateProjectRequest) => ({
  ...project,
  startDate: project.startDate || null,
  dueDate: project.dueDate || null,
});
