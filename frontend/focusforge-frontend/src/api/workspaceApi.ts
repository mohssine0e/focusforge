import { httpClient } from './httpClient';
import type { CreateWorkspaceRequest, Workspace } from '../types';

export type { CreateWorkspaceRequest, Workspace } from '../types';

class WorkspaceApi {
  async createWorkspace(workspace: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await httpClient.post('/api/workspaces', workspace);
    return response.data;
  }

  async getWorkspaces(): Promise<Workspace[]> {
    const response = await httpClient.get('/api/workspaces');
    return response.data;
  }

  async getWorkspace(id: number): Promise<Workspace> {
    const response = await httpClient.get(`/api/workspaces/${id}`);
    return response.data;
  }

  async updateWorkspace(id: number, workspace: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await httpClient.put(`/api/workspaces/${id}`, workspace);
    return response.data;
  }

  async deleteWorkspace(id: number): Promise<void> {
    await httpClient.delete(`/api/workspaces/${id}`);
  }
}

export const workspaceApi = new WorkspaceApi();
