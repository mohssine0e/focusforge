import { httpClient } from './httpClient';
import type { Task, TaskDependency, TaskRequest, TaskStatusType } from '../types';

export type { Task, TaskDependency, TaskRequest, TaskStatusType } from '../types';

export interface DueTaskFilters {
  from?: string;
  to?: string;
  workspaceId?: number;
  projectId?: number;
}

class TaskApi {
  async getTasksByProject(projectId: number, sort?: string): Promise<Task[]> {
    const response = await httpClient.get(`/api/projects/${projectId}/tasks`, {
      params: sort ? { sort } : undefined,
    });
    return response.data;
  }

  async getRecommendedTask(projectId: number, strategy: string): Promise<Task | null> {
    const response = await httpClient.get(`/api/projects/${projectId}/tasks/recommended`, {
      params: { strategy },
    });
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await httpClient.get(`/api/tasks/${id}`);
    return response.data;
  }

  async getDueTasks(filters?: DueTaskFilters): Promise<Task[]> {
    const response = await httpClient.get('/api/tasks/due', {
      params: filters,
    });
    return response.data;
  }

  async createTask(projectId: number, taskData: TaskRequest): Promise<Task> {
    const response = await httpClient.post(`/api/projects/${projectId}/tasks`, null, {
      params: {
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
      },
    });
    return response.data;
  }

  async updateTask(id: number, taskData: TaskRequest): Promise<Task> {
    const response = await httpClient.put(`/api/tasks/${id}`, null, {
      params: {
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
      },
    });
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await httpClient.delete(`/api/tasks/${id}`);
  }

  async updateTaskStatus(taskId: number, status: TaskStatusType): Promise<Task> {
    const response = await httpClient.patch(`/api/tasks/${taskId}/status`, null, {
      params: { status },
    });
    return response.data;
  }

  async getDependencies(taskId: number): Promise<TaskDependency[]> {
    const response = await httpClient.get(`/api/tasks/${taskId}/dependencies`);
    return response.data;
  }

  async addDependency(taskId: number, dependsOnTaskId: number): Promise<TaskDependency> {
    const response = await httpClient.post(`/api/tasks/${taskId}/dependencies/${dependsOnTaskId}`);
    return response.data;
  }

  async removeDependency(taskId: number, dependsOnTaskId: number): Promise<void> {
    await httpClient.delete(`/api/tasks/${taskId}/dependencies/${dependsOnTaskId}`);
  }
}

export const taskApi = new TaskApi();
