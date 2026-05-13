import { httpClient } from './httpClient';
import type { Task, TaskRequest, TaskStatusType } from '../types';

export type { Task, TaskRequest, TaskStatusType } from '../types';

class TaskApi {
  async getTasksByProject(projectId: number): Promise<Task[]> {
    const response = await httpClient.get(`/api/projects/${projectId}/tasks`);
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await httpClient.get(`/api/tasks/${id}`);
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
}

export const taskApi = new TaskApi();
