import { httpClient } from './httpClient';

export interface Workspace {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description: string;
}

class WorkspaceApi {
  private readonly baseUrl = 'http://localhost:8080';

  async createWorkspace(workspace: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await httpClient.post<Workspace>(`${this.baseUrl}/api/workspaces`, workspace);
    return response.data;
  }

  async getWorkspaces(): Promise<Workspace[]> {
    const response = await httpClient.get<Workspace[]>(`${this.baseUrl}/api/workspaces`);
    return response.data;
  }

  async getWorkspace(id: number): Promise<Workspace> {
    const response = await httpClient.get<Workspace>(`${this.baseUrl}/api/workspaces/${id}`);
    return response.data;
  }

  async updateWorkspace(id: number, workspace: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await httpClient.put<Workspace>(`${this.baseUrl}/api/workspaces/${id}`, workspace);
    return response.data;
  }

  async deleteWorkspace(id: number): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/api/workspaces/${id}`);
  }
}

export const workspaceApi = new WorkspaceApi();