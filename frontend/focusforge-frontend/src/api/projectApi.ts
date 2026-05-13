import { httpClient } from './httpClient';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
}

export interface ProjectRequest {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
}

class ProjectApi {
  private readonly baseUrl = 'http://localhost:8080';

  async createProject(workspaceId: number, project: CreateProjectRequest): Promise<Project> {
    const response = await httpClient.post<Project>(`${this.baseUrl}/api/workspaces/${workspaceId}/projects`, project);
    return response.data;
  }

  async getProjects(workspaceId: number): Promise<Project[]> {
    const response = await httpClient.get<Project[]>(`${this.baseUrl}/api/workspaces/${workspaceId}/projects`);
    return response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response = await httpClient.get<Project>(`${this.baseUrl}/projects/${id}`);
    return response.data;
  }

  async updateProject(id: number, project: CreateProjectRequest): Promise<Project> {
    const response = await httpClient.put<Project>(`${this.baseUrl}/projects/${id}`, project);
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/projects/${id}`);
  }
}

export const projectApi = new ProjectApi();