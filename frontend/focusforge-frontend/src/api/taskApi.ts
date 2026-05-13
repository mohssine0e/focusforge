import { httpClient } from '../httpClient';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  dueDate: string;
  estimatedMinutes: number;
  project: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

class TaskApi {
  private readonly baseUrl = 'http://localhost:8080/api';

  async getTasksByProject(projectId: number): Promise<Task[]> {
    const response = await httpClient.get(`${this.baseUrl}/projects/${projectId}/tasks`);
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await httpClient.get(`${this.baseUrl}/tasks/${id}`);
    return response.data;
  }

  async createTask(projectId: number, taskData: any): Promise<Task> {
    const response = await httpClient.post(`${this.baseUrl}/projects/${projectId}/tasks`, taskData);
    return response.data;
  }

  async updateTask(id: number, taskData: any): Promise<Task> {
    const response = await httpClient.put(`${this.baseUrl}/tasks/${id}`, taskData);
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/tasks/${id}`);
  }
}

export const taskApi = new TaskApi();